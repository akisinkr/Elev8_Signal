"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Briefcase,
  Linkedin,
  Brain,
  Target,
  TrendingUp,
  Network,
  Lightbulb,
  Rocket,
  Shield,
  Loader2,
  ExternalLink,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";

const BUCKET_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  career_trajectory: { label: "Career Trajectory", icon: <TrendingUp className="size-4" />, color: "text-blue-400" },
  domain_expertise: { label: "Domain Expertise", icon: <Brain className="size-4" />, color: "text-purple-400" },
  leadership: { label: "Leadership & Influence", icon: <Shield className="size-4" />, color: "text-amber-400" },
  innovation: { label: "Innovation & Problem-Solving", icon: <Lightbulb className="size-4" />, color: "text-emerald-400" },
  network: { label: "Network & Community", icon: <Network className="size-4" />, color: "text-cyan-400" },
  growth_potential: { label: "Growth Potential", icon: <Rocket className="size-4" />, color: "text-rose-400" },
};

interface BucketScore {
  bucket: string;
  score: number;
  evidence: string[];
  highlights: string[];
}

interface XrayProfile {
  status: string;
  summary: string | null;
  summaryKr: string | null;
  analyzedAt: string | null;
  bucketScores: BucketScore[];
}

interface ConfidenceScore {
  selfDeclared: number;
  xrayVerified: number;
  peerValidated: number;
  composite: number;
}

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  company: string | null;
  jobTitle: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  headline: string | null;
  knownFor: string | null;
  spDomain: string | null;
  spAction: string | null;
  spScale: string | null;
  spStage: string | null;
  spGeo: string | null;
  superpowers: string[];
  challenges: string[];
  knownForDetail: string | null;
  adviceSeeking: string | null;
  passionTopic: string | null;
  dreamConnection: string | null;
  cardCompletedAt: string | null;
  createdAt: string;
  xrayProfiles: XrayProfile[];
  confidenceScore: ConfidenceScore | null;
}

interface MemberDetailDialogProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({ memberId, open, onOpenChange }: MemberDetailDialogProps) {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId || !open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/members/${memberId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load member");
        return res.json();
      })
      .then((data) => setMember(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [memberId, open]);

  const xray = member?.xrayProfiles?.[0] ?? null;
  const confidence = member?.confidenceScore;
  const buckets = xray?.bucketScores ?? [];
  const avgScore = buckets.length > 0
    ? Math.round(buckets.reduce((sum, b) => sum + b.score, 0) / buckets.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-400">{error}</div>
        ) : member ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt="" className="size-14 rounded-full object-cover" />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl">
                    {member.firstName} {member.lastName}
                  </DialogTitle>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="size-3.5" />
                    <span>{member.jobTitle || "—"}</span>
                    {member.company && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{member.company}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground/60">
                    <span>{member.email}</span>
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Linkedin className="size-3" />
                        LinkedIn
                        <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                {/* Confidence badge */}
                {confidence && confidence.composite > 0 && (
                  <div className="text-center shrink-0">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(confidence.composite)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Confidence
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <Tabs defaultValue="xray" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="xray" className="flex-1">Xray Analysis</TabsTrigger>
                <TabsTrigger value="profile" className="flex-1">Profile Data</TabsTrigger>
                <TabsTrigger value="confidence" className="flex-1">Confidence</TabsTrigger>
              </TabsList>

              {/* ── XRAY TAB ── */}
              <TabsContent value="xray" className="mt-4 space-y-5">
                {!xray || xray.status !== "COMPLETED" ? (
                  <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                    <Brain className="size-8 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {xray?.status === "PROCESSING"
                        ? "Xray analysis is running..."
                        : xray?.status === "FAILED"
                        ? "Xray analysis failed. Try re-running from the members table."
                        : "No Xray analysis yet. Run it from the members table."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    {xray.summary && (
                      <div className="rounded-xl border border-border/60 bg-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="size-4 text-amber-400" />
                          AI Summary
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">{xray.summary}</p>
                        {xray.summaryKr && (
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2 border-t border-border/40 pt-2">
                            {xray.summaryKr}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Average Score */}
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                      <div className="text-3xl font-bold text-foreground">{avgScore}</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Average Bucket Score</div>
                        <div className="text-xs text-muted-foreground">Across {buckets.length} dimensions</div>
                      </div>
                      <div className="flex-1">
                        <Progress value={avgScore} className="h-2.5" />
                      </div>
                    </div>

                    {/* Bucket Scores */}
                    <div className="space-y-3">
                      {buckets
                        .sort((a, b) => b.score - a.score)
                        .map((bucket) => {
                          const config = BUCKET_CONFIG[bucket.bucket] ?? {
                            label: bucket.bucket,
                            icon: <Target className="size-4" />,
                            color: "text-muted-foreground",
                          };
                          return (
                            <details key={bucket.bucket} className="group rounded-xl border border-border/60 bg-card overflow-hidden">
                              <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                <span className={config.color}>{config.icon}</span>
                                <span className="text-sm font-medium text-foreground flex-1">{config.label}</span>
                                <span className="text-lg font-bold text-foreground tabular-nums">{bucket.score}</span>
                                <div className="w-24">
                                  <Progress value={bucket.score} className="h-2" />
                                </div>
                              </summary>
                              <div className="px-4 pb-4 pt-1 border-t border-border/40 overflow-hidden">
                                {bucket.highlights.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Highlights</div>
                                    <div className="space-y-1">
                                      {bucket.highlights.map((h, i) => (
                                        <p key={i} className="text-xs text-primary/80 bg-primary/10 rounded-md px-2.5 py-1.5 leading-relaxed break-words">
                                          {h}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {bucket.evidence.length > 0 && (
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Evidence</div>
                                    <ul className="space-y-1">
                                      {bucket.evidence.map((e, i) => (
                                        <li key={i} className="text-xs text-foreground/70 flex items-start gap-2 break-words min-w-0">
                                          <span className="text-muted-foreground/40 mt-0.5 shrink-0">•</span>
                                          <span className="break-words min-w-0">{e}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </details>
                          );
                        })}
                    </div>

                    {xray.analyzedAt && (
                      <div className="text-[11px] text-muted-foreground/50 text-right">
                        Analyzed {new Date(xray.analyzedAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── PROFILE TAB ── */}
              <TabsContent value="profile" className="mt-4 space-y-4">
                {/* 5D Superpower */}
                <div className="rounded-xl border border-border/60 bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="size-4 text-amber-400" />
                    5D Superpower
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <ProfileField label="Domain" value={member.spDomain} />
                    <ProfileField label="Action" value={member.spAction} />
                    <ProfileField label="Scale" value={member.spScale} />
                    <ProfileField label="Stage" value={member.spStage} />
                    <ProfileField label="Geography" value={member.spGeo} />
                    <ProfileField label="Known For" value={member.knownFor} />
                  </div>
                </div>

                {/* Conversational Questions */}
                {(member.knownForDetail || member.adviceSeeking || member.passionTopic) && (
                  <div className="rounded-xl border border-border/60 bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="size-4 text-blue-400" />
                      Conversational Questions
                    </h3>
                    <div className="space-y-3">
                      {member.knownForDetail && (
                        <QAField
                          question="What are you known for at work?"
                          answer={member.knownForDetail}
                        />
                      )}
                      {member.adviceSeeking && (
                        <QAField
                          question="If you could get advice from anyone, what would you ask?"
                          answer={member.adviceSeeking}
                        />
                      )}
                      {member.passionTopic && (
                        <QAField
                          question="What topic could you talk about for hours?"
                          answer={member.passionTopic}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Superpowers & Challenges */}
                {(member.superpowers.length > 0 || member.challenges.length > 0) && (
                  <div className="grid grid-cols-2 gap-3">
                    {member.superpowers.length > 0 && (
                      <div className="rounded-xl border border-border/60 bg-card p-5 overflow-hidden min-w-0">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="size-4 text-amber-400 shrink-0" />
                          Superpowers
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {member.superpowers.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 max-w-full truncate">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {member.challenges.length > 0 && (
                      <div className="rounded-xl border border-border/60 bg-card p-5 overflow-hidden min-w-0">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Target className="size-4 text-rose-400 shrink-0" />
                          Challenges
                        </h3>
                        <div className="space-y-1.5">
                          {member.challenges.map((c) => (
                            <p key={c} className="text-xs text-rose-400/80 leading-snug break-words">
                              {c}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dream Connection */}
                {member.dreamConnection && (
                  <div className="rounded-xl border border-border/60 bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Heart className="size-4 text-pink-400" />
                      Dream Connection
                    </h3>
                    <p className="text-sm text-foreground/70">{member.dreamConnection}</p>
                  </div>
                )}

                {/* Bio */}
                {(member.bio || member.headline) && (
                  <div className="rounded-xl border border-border/60 bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      Bio
                    </h3>
                    <p className="text-sm text-foreground/70">{member.bio || member.headline}</p>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground/50 text-right">
                  Joined {new Date(member.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                  {member.cardCompletedAt && (
                    <> · Card completed {new Date(member.cardCompletedAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}</>
                  )}
                </div>
              </TabsContent>

              {/* ── CONFIDENCE TAB ── */}
              <TabsContent value="confidence" className="mt-4 space-y-4">
                {!confidence || confidence.composite === 0 ? (
                  <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                    <TrendingUp className="size-8 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No confidence score yet. It&apos;s calculated after onboarding + Xray.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Composite Score */}
                    <div className="rounded-xl border border-border/60 bg-card p-6 text-center">
                      <div className="text-5xl font-bold text-foreground">
                        {Math.round(confidence.composite)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Composite Score</div>
                      <Progress value={confidence.composite} className="h-3 mt-4" />
                    </div>

                    {/* 3 Layers */}
                    <div className="grid grid-cols-3 gap-3">
                      <ConfidenceLayer
                        label="Self-Declared"
                        value={confidence.selfDeclared}
                        max={30}
                        description="Profile completeness"
                        color="text-blue-400"
                      />
                      <ConfidenceLayer
                        label="Xray-Verified"
                        value={confidence.xrayVerified}
                        max={40}
                        description="LinkedIn analysis"
                        color="text-amber-400"
                      />
                      <ConfidenceLayer
                        label="Peer-Validated"
                        value={confidence.peerValidated}
                        max={30}
                        description="Exchange feedback"
                        color="text-emerald-400"
                      />
                    </div>

                    {/* Formula */}
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                      <div className="text-[11px] text-muted-foreground text-center font-mono">
                        Self-Declared ({Math.round(confidence.selfDeclared)}/30) + Xray ({Math.round(confidence.xrayVerified)}/40) + Peer ({Math.round(confidence.peerValidated)}/30) = <span className="text-foreground font-semibold">{Math.round(confidence.composite)}/100</span>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground/80">{value || "—"}</div>
    </div>
  );
}

function QAField({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{question}</div>
      <div className="text-sm text-foreground/80 bg-muted/30 rounded-lg px-3 py-2">{answer}</div>
    </div>
  );
}

function ConfidenceLayer({
  label,
  value,
  max,
  description,
  color,
}: {
  label: string;
  value: number;
  max: number;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{Math.round(value)}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">/ {max}</div>
      <div className="text-xs font-medium text-foreground mt-2">{label}</div>
      <div className="text-[10px] text-muted-foreground">{description}</div>
      <Progress value={(value / max) * 100} className="h-1.5 mt-2" />
    </div>
  );
}
