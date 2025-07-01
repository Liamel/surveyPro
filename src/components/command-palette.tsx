'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Settings, 
  FileText, 
  Users, 
  Home,
  Command,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: 'home',
      title: 'Go to Home',
      description: 'Navigate to the home page',
      icon: <Home className="h-4 w-4" />,
      action: () => router.push('/'),
      keywords: ['home', 'main', 'dashboard', 'index']
    },
    {
      id: 'surveys',
      title: 'Browse Surveys',
      description: 'View all available surveys',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/surveys'),
      keywords: ['surveys', 'browse', 'view', 'list', 'available']
    },
    {
      id: 'cms',
      title: 'CMS Dashboard',
      description: 'Access the content management system',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/cms'),
      keywords: ['cms', 'dashboard', 'admin', 'manage', 'control']
    },
    {
      id: 'create-survey',
      title: 'Create Survey',
      description: 'Create a new survey',
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push('/cms/create'),
      keywords: ['create', 'new', 'survey', 'make', 'build']
    },
    {
      id: 'manage-surveys',
      title: 'Manage Surveys',
      description: 'Manage existing surveys',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/cms/manage'),
      keywords: ['manage', 'edit', 'surveys', 'existing', 'modify']
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/cms'),
      keywords: ['users', 'user', 'management', 'permissions', 'people']
    }
  ];

  // Filter commands based on search query
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  useHotkeys('escape', () => {
    setIsOpen(false);
  }, { enableOnFormTags: true });

  // Handle arrow keys and enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setSearchQuery('');
            setSelectedIndex(0);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleCommandSelect = (command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => handleCommandSelect(command)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-gray-500">
                      {command.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {command.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {command.description}
                      </p>
                    </div>
                    {index === selectedIndex && (
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          Enter
                        </Badge>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
              <div className="flex items-center space-x-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>↵</span>
                <span>Select</span>
              </div>
            </div>
            <span>Press Esc to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 