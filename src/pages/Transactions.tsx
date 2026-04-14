import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionDetail from "@/components/transactions/TransactionDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createFadeUpItem, createStaggerContainer } from "@/lib/motion";
import { DEFAULT_BOOK_COVER } from "@/lib/mockDbSeed";
import { getTransactions, updateTransactionStatus } from "@/services/transactionService";

type TransactionRow = Awaited<ReturnType<typeof getTransactions>>[number];

type TransactionView = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    condition: number;
  };
  type: "borrow" | "lend" | "return";
  status: "pending" | "active" | "completed" | "cancelled";
  date: string;
  dueDate?: string;
  notes?: string;
};

const normalizeStatus = (status: string): TransactionView["status"] => {
  if (["pending", "active", "completed", "cancelled"].includes(status)) {
    return status as TransactionView["status"];
  }

  return "pending";
};

const toTransactionView = (transaction: TransactionRow, currentUserId: string): TransactionView | null => {
  const isBorrower = transaction.borrower_id === currentUserId;
  const otherUser = isBorrower ? transaction.lender : transaction.borrower;
  const book = transaction.book;

  if (!otherUser || !book) {
    return null;
  }

  return {
    id: transaction.id,
    user: {
      id: otherUser.id,
      name: otherUser.display_name || otherUser.username,
      avatar: otherUser.avatar_url,
    },
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.cover_image || DEFAULT_BOOK_COVER,
      condition: book.condition,
    },
    type: isBorrower ? "borrow" : "lend",
    status: normalizeStatus(transaction.status),
    date: transaction.request_date || transaction.created_at || new Date().toISOString(),
    dueDate: transaction.due_date,
    notes: transaction.notes,
  };
};

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const rows = await getTransactions({ userId: user.id, type: "all" });
      const mappedTransactions = rows
        .map((transaction) => toTransactionView(transaction, user.id))
        .filter((transaction): transaction is TransactionView => Boolean(transaction));

      setTransactions(mappedTransactions);
    } catch (loadError: any) {
      toast({
        title: "Unable to load transactions",
        description: loadError.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const handleApprove = async (id: string) => {
    try {
      await updateTransactionStatus(id, "active");
      toast({
        title: "Transaction approved",
        description: "The borrower has been notified and the loan is now active.",
      });
      setIsDetailOpen(false);
      await loadTransactions();
    } catch (error: any) {
      toast({
        title: "Unable to approve request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await updateTransactionStatus(id, "cancelled");
      toast({
        title: "Transaction declined",
        description: "The requester has been notified.",
      });
      setIsDetailOpen(false);
      await loadTransactions();
    } catch (error: any) {
      toast({
        title: "Unable to decline request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateTransactionStatus(id, "completed");
      toast({
        title: "Transaction completed",
        description: "The return has been recorded and the book is available again.",
      });
      setIsDetailOpen(false);
      await loadTransactions();
    } catch (error: any) {
      toast({
        title: "Unable to complete transaction",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/messages?user=${userId}`);
  };

  const handleViewDetails = (id: string) => {
    setSelectedTransaction(id);
    setIsDetailOpen(true);
  };

  const getFilteredTransactions = () => {
    if (activeTab === "incoming") {
      return transactions.filter((transaction) => transaction.type === "lend");
    }

    if (activeTab === "outgoing") {
      return transactions.filter((transaction) => transaction.type === "borrow");
    }

    return transactions;
  };

  const getSelectedTransaction = () => {
    return transactions.find((transaction) => transaction.id === selectedTransaction);
  };

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2">Transactions</h1>
              <p className="text-muted-foreground">
                Track live borrowing requests, active loans, and completed returns.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              {isLoading ? (
                <div className="rounded-lg border bg-white p-8 text-center text-sm text-muted-foreground">
                  Loading your request history...
                </div>
              ) : (
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
                    <TabsTrigger value="outgoing">Outgoing Requests</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    <TransactionList
                      transactions={getFilteredTransactions()}
                      onViewDetails={handleViewDetails}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                      onMessage={handleMessage}
                      type={activeTab as "incoming" | "outgoing" | "all"}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          {getSelectedTransaction() && (
            <TransactionDetail
              transaction={getSelectedTransaction()!}
              onApprove={handleApprove}
              onDecline={handleDecline}
              onComplete={handleComplete}
              onMessage={handleMessage}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </PageTransition>
  );
};

export default Transactions;
