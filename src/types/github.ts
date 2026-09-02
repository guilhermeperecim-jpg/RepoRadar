import { Request } from 'express';

// ─── Extensão do Express Request ─────────────────────────────────────────────

/**
 * Request do Express com rawBody capturado para validação HMAC.
 */
export interface RequestWithRawBody extends Request {
    rawBody?: Buffer;
}

// ─── GitHub Commit ───────────────────────────────────────────────────────────

export interface GitHubCommitAuthor {
    name: string;
    email: string;
    username?: string;
}

export interface GitHubCommit {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: GitHubCommitAuthor;
    added: string[];
    modified: string[];
    removed: string[];
}

// ─── GitHub Push Payload ─────────────────────────────────────────────────────

export interface GitHubPushPayload {
    ref: string;
    compare: string;
    commits: GitHubCommit[];
    pusher: {
        name: string;
        email: string;
    };
    sender: {
        login: string;
        type: string;
        avatar_url?: string;
    };
    repository: {
        full_name: string;
        name: string;
    };
}

// ─── GitHub Pull Request Payload ─────────────────────────────────────────────

export interface GitHubPullRequestPayload {
    action: string;
    pull_request: {
        number: number;
        title: string;
        body: string | null;
        merged: boolean;
        html_url: string;
        additions: number;
        deletions: number;
        commits: number;
        user: {
            login: string;
            avatar_url?: string;
        };
        head: {
            ref: string;
        };
        base: {
            ref: string;
        };
    };
    sender: {
        login: string;
        avatar_url?: string;
    };
    repository: {
        full_name: string;
        name: string;
    };
}
