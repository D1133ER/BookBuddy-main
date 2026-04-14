
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Check, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { createFadeUpItem, createHoverLift, createStaggerContainer } from "@/lib/motion";

interface Transaction {
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
  };
  type: "borrow" | "lend" | "return";
  status: "pending" | "active" | "completed" | "cancelled";
  date: string;
  dueDate?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  onMessage?: (userId: string) => void;
  type?: "incoming" | "outgoing" | "all";
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const typeLabels = {
  borrow: "Borrowed",
  lend: "Lent",
  return: "Returned",
};

const TransactionList = ({
  transactions = [],
  onViewDetails,
  onApprove,
  onDecline,
  onMessage,
  type = "all",
}: TransactionListProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 16);
  const displayTransactions = transactions;

  const handleViewDetails = (id: string) => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onApprove) {
      onApprove(id);
    }
  };

  const handleDecline = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDecline) {
      onDecline(id);
    }
  };

  const handleMessage = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(userId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          {type === "incoming"
            ? "Incoming Requests"
            : type === "outgoing"
              ? "Outgoing Requests"
              : "All Transactions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-4"
          >
            {displayTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                variants={itemVariants}
                whileHover={createHoverLift(shouldReduceMotion, -3)}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(transaction.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={transaction.user.avatar || undefined} alt={transaction.user.name} />
                        <AvatarFallback>
                          {transaction.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center">
                        <img
                          src={transaction.book.coverImage}
                          alt="book"
                          className="h-4 w-4 rounded-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[transaction.type]} "{transaction.book.title}
                        "
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[transaction.status]}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>

                    {transaction.dueDate && transaction.status === "active" && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        Due {new Date(transaction.dueDate).toLocaleDateString()}
                      </Badge>
                    )}

                    <div className="flex items-center space-x-1 ml-auto">
                      {transaction.status === "pending" &&
                        type === "incoming" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={(e) => handleApprove(e, transaction.id)}
                              aria-label={`Approve request for ${transaction.book.title}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={(e) => handleDecline(e, transaction.id)}
                              aria-label={`Decline request for ${transaction.book.title}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleMessage(e, transaction.user.id)}
                        aria-label={`Message ${transaction.user.name}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
