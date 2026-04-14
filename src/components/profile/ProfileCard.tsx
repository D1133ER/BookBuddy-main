
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Star, Edit } from "lucide-react";

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    location?: string;
    joinDate: string;
    stats?: {
      books: number;
      exchanges: number;
      rating: number;
    };
  };
  isCurrentUser?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
}

const ProfileCard = ({
  user,
  isCurrentUser = false,
  onEdit,
  onMessage,
}: ProfileCardProps) => {
  const defaultUser = {
    id: "user-1",
    name: "Jane Doe",
    username: "janedoe",
    avatar: "jane",
    bio: "Book lover and collector. Always looking for new reads!",
    location: "San Francisco, CA",
    joinDate: "2023-01-15",
    stats: {
      books: 24,
      exchanges: 12,
      rating: 4.8,
    },
  };

  const displayUser = { ...defaultUser, ...user };
  const joinDate = new Date(displayUser.joinDate);

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>
      <CardHeader className="pt-0 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={displayUser.avatar || undefined} alt={displayUser.name} />
              <AvatarFallback className="text-2xl">
                {displayUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{displayUser.name}</h2>
              <p className="text-muted-foreground">@{displayUser.username}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isCurrentUser ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayUser.bio && (
          <div>
            <p className="text-sm">{displayUser.bio}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {displayUser.location && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {displayUser.location}
            </Badge>
          )}
          <Badge variant="outline">
            Joined{" "}
            {joinDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-center mb-1">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold">{displayUser.stats?.books || 0}</p>
            <p className="text-xs text-muted-foreground">Books</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-center mb-1">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold">
              {displayUser.stats?.exchanges || 0}
            </p>
            <p className="text-xs text-muted-foreground">Exchanges</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-center mb-1">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xl font-bold">
              {displayUser.stats?.rating || 0}
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
