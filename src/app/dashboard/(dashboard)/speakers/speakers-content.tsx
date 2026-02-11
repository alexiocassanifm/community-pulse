"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SpeakerStatusBadge } from "@/components/dashboard/speaker-status-badge";
import { SPEAKER_FORMATS } from "@/constants/speakers";
import type { SpeakerSubmissionListItem, SpeakerStatus } from "@/types/speaker";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function getFormatLabel(format: string): string {
  return SPEAKER_FORMATS.find((f) => f.value === format)?.label ?? format;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">
        {status === "all"
          ? "No speaker submissions yet."
          : `No ${status} submissions.`}
      </p>
    </div>
  );
}

export function SpeakersContent() {
  const [submissions, setSubmissions] = useState<SpeakerSubmissionListItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchSubmissions = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const params = status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/speakers/admin/list${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab, fetchSubmissions]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        {STATUS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {STATUS_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {loading ? (
            <TableSkeleton />
          ) : submissions.length === 0 ? (
            <EmptyState status={tab.value} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Talk Title</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>{submission.talk_title}</TableCell>
                      <TableCell>{getFormatLabel(submission.format)}</TableCell>
                      <TableCell>
                        <SpeakerStatusBadge
                          status={submission.status as SpeakerStatus}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/dashboard/speakers/${submission.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
