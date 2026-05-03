import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Calendar, Check, X, RotateCcw } from 'lucide-react';

interface TransactionDetailProps {
  transaction: {
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
    type: 'borrow' | 'lend' | 'return';
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    date: string;
    dueDate?: string;
    notes?: string;
  };
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  onComplete?: (id: string) => void;
  onMessage?: (userId: string) => void;
  onClose?: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const typeLabels = {
  borrow: 'Borrowed',
  lend: 'Lent',
  return: 'Returned',
};

const conditionLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Like New'];

const TransactionDetail = ({
  transaction,
  onApprove,
  onDecline,
  onComplete,
  onMessage,
  onClose,
}: TransactionDetailProps) => {
  const isIncoming = transaction.type === 'lend';
  const canApprove = isIncoming && transaction.status === 'pending';
  const canComplete = transaction.status === 'active';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
            <img
              src={transaction.book.coverImage}
              alt={transaction.book.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="md:w-2/3 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{transaction.book.title}</h2>
            <p className="text-lg text-muted-foreground">{transaction.book.author}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusColors[transaction.status]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {typeLabels[transaction.type]}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Condition: {conditionLabels[transaction.book.condition - 1]}
            </Badge>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={transaction.user.avatar || undefined}
                    alt={transaction.user.name}
                  />
                  <AvatarFallback>
                    {transaction.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{transaction.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isIncoming ? 'Requested to borrow' : 'You requested from'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Requested: {new Date(transaction.date).toLocaleDateString()}
              </span>
            </div>
            {transaction.dueDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Due: {new Date(transaction.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {transaction.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1">Notes</h3>
              <p className="text-sm text-muted-foreground">{transaction.notes}</p>
            </div>
          )}

          <div className="pt-4 flex flex-wrap justify-end gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}

            {onMessage && (
              <Button variant="outline" onClick={() => onMessage(transaction.user.id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}

            {canApprove && onApprove && onDecline && (
              <>
                <Button variant="outline" onClick={() => onDecline(transaction.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={() => onApprove(transaction.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}

            {canComplete && onComplete && (
              <Button onClick={() => onComplete(transaction.id)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Mark as Returned
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
