"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MessageSquare } from "lucide-react"
import type { Startup } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils"

interface NotesSectionProps {
  startup: Startup
}

export function NotesSection({ startup }: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState("")

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would make an API call
      console.log("Adding note:", newNote)
      setNewNote("")
      setIsAddingNote(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes ({startup.notes.length})
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddingNote(true)} disabled={isAddingNote}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAddingNote && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <Textarea
              placeholder="Add a note about this startup..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-20"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote}>
                Save Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingNote(false)
                  setNewNote("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing Notes */}
        {startup.notes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs">Add notes to track important information</p>
          </div>
        ) : (
          <div className="space-y-4">
            {startup.notes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note) => (
                <div key={note.id} className="flex gap-3 p-3 rounded-lg border bg-card/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{note.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.text}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
