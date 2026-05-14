'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Image,
  File,
  ChevronLeft,
  Check,
  CheckCheck,
  Circle,
  Plus,
  Users,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

// Mock data
const conversations = [
  {
    id: '1',
    name: 'Mr. Hadj - Mathematics',
    avatar: 'MH',
    lastMessage: 'The homework deadline has been extended to Friday.',
    time: '10:30',
    unread: 2,
    online: true,
    isGroup: false,
    role: 'TEACHER',
  },
  {
    id: '2',
    name: 'Class 3AS-Math',
    avatar: '3M',
    lastMessage: 'Ahmed: When is the exam?',
    time: '09:15',
    unread: 5,
    online: false,
    isGroup: true,
    members: 32,
  },
  {
    id: '3',
    name: 'Mrs. Amrani - Physics',
    avatar: 'MA',
    lastMessage: 'You: Thank you for the explanation.',
    time: 'Yesterday',
    unread: 0,
    online: false,
    isGroup: false,
    role: 'TEACHER',
  },
  {
    id: '4',
    name: 'Parent: Mr. Benali',
    avatar: 'MB',
    lastMessage: 'I would like to schedule a meeting.',
    time: 'Yesterday',
    unread: 1,
    online: true,
    isGroup: false,
    role: 'PARENT',
  },
  {
    id: '5',
    name: 'Administration',
    avatar: 'AD',
    lastMessage: 'Your payment has been received.',
    time: 'Mon',
    unread: 0,
    online: true,
    isGroup: false,
    role: 'ADMIN',
  },
];

const messages = [
  {
    id: '1',
    senderId: 'teacher1',
    senderName: 'Mr. Hadj',
    content: 'Good morning class! I hope everyone is doing well.',
    time: '09:00',
    isMe: false,
    status: 'read',
  },
  {
    id: '2',
    senderId: 'me',
    senderName: 'You',
    content: 'Good morning Mr. Hadj! Yes, we are ready for the lesson.',
    time: '09:02',
    isMe: true,
    status: 'read',
  },
  {
    id: '3',
    senderId: 'teacher1',
    senderName: 'Mr. Hadj',
    content: 'Great! Today we will continue with derivatives. Please open your textbooks to page 145.',
    time: '09:05',
    isMe: false,
    status: 'read',
  },
  {
    id: '4',
    senderId: 'teacher1',
    senderName: 'Mr. Hadj',
    content: 'I have also uploaded some additional practice problems on the course page.',
    time: '09:10',
    isMe: false,
    status: 'read',
  },
  {
    id: '5',
    senderId: 'me',
    senderName: 'You',
    content: 'Thank you! Will these be part of the exam?',
    time: '09:12',
    isMe: true,
    status: 'read',
  },
  {
    id: '6',
    senderId: 'teacher1',
    senderName: 'Mr. Hadj',
    content: 'Yes, similar problems will appear. I recommend practicing them thoroughly.',
    time: '09:15',
    isMe: false,
    status: 'read',
  },
  {
    id: '7',
    senderId: 'teacher1',
    senderName: 'Mr. Hadj',
    content: 'Also, a reminder that the homework deadline has been extended to Friday due to the holiday on Thursday.',
    time: '10:30',
    isMe: false,
    status: 'delivered',
  },
];

const contacts = [
  { id: '1', name: 'Mr. Hadj', role: 'TEACHER', subject: 'Mathematics', avatar: 'MH' },
  { id: '2', name: 'Mrs. Amrani', role: 'TEACHER', subject: 'Physics', avatar: 'MA' },
  { id: '3', name: 'Mr. Benali', role: 'TEACHER', subject: 'Chemistry', avatar: 'MB' },
  { id: '4', name: 'Mrs. Martin', role: 'TEACHER', subject: 'French', avatar: 'MM' },
  { id: '5', name: 'Ahmed Benali', role: 'STUDENT', class: '3AS-Math', avatar: 'AB' },
  { id: '6', name: 'Sara Meziane', role: 'STUDENT', class: '3AS-Math', avatar: 'SM' },
  { id: '7', name: 'Administration', role: 'ADMIN', avatar: 'AD' },
];

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<typeof conversations[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // Handle sending message
    setMessageInput('');
  };

  const handleSelectConversation = (conv: typeof conversations[0]) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-lg border bg-card overflow-hidden">
        {/* Conversations List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col",
          showMobileChat && "hidden md:flex"
        )}>
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('messages.newMessage')}</DialogTitle>
                    <DialogDescription>
                      {t('messages.selectRecipient')}
                    </DialogDescription>
                  </DialogHeader>
                  <Command className="rounded-lg border">
                    <CommandInput placeholder={t('messages.searchContacts')} />
                    <CommandList>
                      <CommandEmpty>{t('messages.noContacts')}</CommandEmpty>
                      <CommandGroup heading={t('roles.TEACHER')}>
                        {contacts.filter(c => c.role === 'TEACHER').map((contact) => (
                          <CommandItem
                            key={contact.id}
                            onSelect={() => setIsNewChatOpen(false)}
                            className="cursor-pointer"
                          >
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{contact.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.subject}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading={t('roles.STUDENT')}>
                        {contacts.filter(c => c.role === 'STUDENT').map((contact) => (
                          <CommandItem
                            key={contact.id}
                            onSelect={() => setIsNewChatOpen(false)}
                            className="cursor-pointer"
                          >
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{contact.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.class}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('messages.searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedConversation?.id === conv.id
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{conv.avatar}</AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-accent border-2 border-card" />
                    )}
                    {conv.isGroup && (
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Users className="h-3 w-3 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conv.name}</p>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {conv.unread}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !showMobileChat && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarFallback>{selectedConversation.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.online ? t('messages.online') : t('messages.offline')}
                      {selectedConversation.isGroup && ` - ${selectedConversation.members} ${t('messages.members')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Info className="mr-2 h-4 w-4" />
                        {t('messages.viewInfo')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <File className="mr-2 h-4 w-4" />
                        {t('messages.sharedFiles')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        {t('messages.deleteChat')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        message.isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}>
                        {!message.isMe && selectedConversation.isGroup && (
                          <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          <span className="text-[10px]">{message.time}</span>
                          {message.isMe && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder={t('messages.typePlaceholder')}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">{t('messages.selectConversation')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('messages.selectConversationDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
