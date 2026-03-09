"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MeetupDialog } from "@/components/dashboard/meetup-dialog";
import type { MeetupRow, MeetupStatus } from "@/types/meetup";

function statusVariant(status: MeetupStatus) {
  if (status === "published") return "default" as const;
  if (status === "past") return "outline" as const;
  return "secondary" as const;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MeetupsContent() {
  const [meetups, setMeetups] = useState<MeetupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState<MeetupRow | undefined>();
  const { toast } = useToast();

  const fetchMeetups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetups");
      if (res.ok) {
        setMeetups(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetups();
  }, [fetchMeetups]);

  const handleToggleHomepage = async (meetup: MeetupRow) => {
    const res = await fetch(`/api/meetups/${meetup.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homepage_visible: !meetup.homepage_visible }),
    });
    if (res.ok) {
      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetup.id ? { ...m, homepage_visible: !m.homepage_visible } : m
        )
      );
    }
  };

  const handleDelete = async (meetup: MeetupRow) => {
    const res = await fetch(`/api/meetups/${meetup.id}`, { method: "DELETE" });
    if (res.ok) {
      setMeetups((prev) => prev.filter((m) => m.id !== meetup.id));
    } else if (res.status === 409) {
      toast({
        title: "Cannot delete",
        description: "This meetup has assigned speakers.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (meetup: MeetupRow) => {
    setEditingMeetup(meetup);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingMeetup(undefined);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setEditingMeetup(undefined);
    fetchMeetups();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Meetup
        </Button>
      </div>

      {meetups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No meetups yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Homepage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetups.map((meetup) => (
              <TableRow key={meetup.id}>
                <TableCell className="font-medium">{meetup.title}</TableCell>
                <TableCell>{formatDate(meetup.date)}</TableCell>
                <TableCell>{meetup.location}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(meetup.status)}>
                    {meetup.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={meetup.homepage_visible}
                    onCheckedChange={() => handleToggleHomepage(meetup)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(meetup)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(meetup)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <MeetupDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingMeetup(undefined);
        }}
        meetup={editingMeetup}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
