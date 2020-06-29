export class GithubBranchDto {
  name: string;
  commit: {
    sha: string;
    node_id: string;
    url: string;
    html_url: string;
    parents: { sha: string; url: string; html_url: string }[];
    commit: {
      author: { name: string; email: string };
      commiter: { name: string; email: string };
      message: string;
      tree: {
        sha: string;
        url: string;
      };
    };
  };
}
