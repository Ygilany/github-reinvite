// Organization and assignment mappings
export const ORGANIZATIONS = {
  "IT3049C-Spring26": {
    name: "IT3049C Spring26",
    owner: "IT3049C", // GitHub organization/owner name
    assignments: {
      "🧑‍💻Lab: Git Started - Your Profile": "git-started-with-your-profile",
      "🧑‍💻 Campus Portal (JS Exercises)": "campus-portal-js-exercises",
      "🧑‍💻 Chatting Application": "chatting-application-lab",
      "🧑‍💻 Wordle": "wordle",
      "🧑‍💻 React Lobby and RPS": "react-game-lobby-and-rps"
    }
  }
} as const;

export type OrganizationKey = keyof typeof ORGANIZATIONS;
