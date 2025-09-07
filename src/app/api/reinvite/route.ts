import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { z } from "zod";

const bodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  username: z.string().min(1),
});

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: token, userAgent: "github-reinvite/1.0" });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { owner, repo, username } = bodySchema.parse(json);

    const octokit = getOctokit();

    // 1) Find invitations for this repo (filter by username)
    const { data: invitations } = await octokit.rest.repos.listInvitations({
      owner,
      repo,
      per_page: 100,
    });

    const matches = invitations.filter(inv => inv.invitee?.login?.toLowerCase() === username.toLowerCase());
    const deleted: Array<{ id: number }> = [];

    // 2) Delete matching invitations
    for (const inv of matches) {
      await octokit.rest.repos.deleteInvitation({
        owner,
        repo,
        invitation_id: inv.id,
      });
      deleted.push({ id: inv.id });
    }

    // 3) Send a fresh invite
    //    - 201 Created => new invitation sent
    //    - 204 No Content => user is already a collaborator
    const resp = await octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
      permission: "push",
    });

    // Some responses include an invitation object in the body,
    // but not always; handle both 201/204.
    const responseData = resp.data as { id?: number; invitation_id?: number };
    const invitationId = responseData?.id ?? responseData?.invitation_id;

    const inviteResult = {
      status: resp.status,
      message:
        resp.status === 201
          ? "Invitation (re)sent"
          : resp.status === 204
          ? "User is already a collaborator (no invite needed)"
          : `Unexpected status ${resp.status}`,
      invitationId,
    };

    return NextResponse.json({
      ok: true,
      input: { owner, repo, username, permission: "push" },
      foundInvitations: matches.map(m => ({ id: m.id, invitee: m.invitee?.login })),
      deletedInvitations: deleted,
      invite: inviteResult,
    });
  } catch (err: unknown) {
    // Map a few common GitHub API errors into helpful messages
    const error = err as { 
      response?: { 
        data?: { message?: string }; 
        status?: number 
      }; 
      message?: string; 
      status?: number 
    };
    const msg = error?.response?.data?.message || error?.message || "Unknown error";
    const status = error?.status || error?.response?.status || 500;

    return NextResponse.json(
      {
        ok: false,
        error: msg,
        details: error?.response?.data ?? null,
      },
      { status }
    );
  }
}