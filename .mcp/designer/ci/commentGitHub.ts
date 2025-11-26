export interface GitHubCommentOptions {
  owner: string;
  repo: string;
  pr: number;
  token: string;
}

export async function commentOnPR(
  options: GitHubCommentOptions,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { owner, repo, pr, token } = options;
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pr}/comments`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-BOS-Designer-MCP",
      },
      body: JSON.stringify({ body: message }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updatePRComment(
  options: GitHubCommentOptions & { commentId: number },
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { owner, repo, commentId, token } = options;
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-BOS-Designer-MCP",
      },
      body: JSON.stringify({ body: message }),
    });

    if (!response.ok) {
      return { success: false, error: await response.text() };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function findExistingComment(
  options: Omit<GitHubCommentOptions, "pr"> & { pr: number },
  marker: string = "AI-BOS Designer"
): Promise<number | null> {
  const { owner, repo, pr, token } = options;
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pr}/comments`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-BOS-Designer-MCP",
      },
    });

    if (!response.ok) return null;

    const comments = (await response.json()) as Array<{ id: number; body: string }>;
    const existing = comments.find((c) => c.body.includes(marker));

    return existing?.id ?? null;
  } catch {
    return null;
  }
}

