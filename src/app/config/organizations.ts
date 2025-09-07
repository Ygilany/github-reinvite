// Organization and assignment mappings
export const ORGANIZATIONS = {
  "18-341": {
    name: "18-341",
    owner: "18-341", // GitHub organization/owner name
    assignments: {
      "P2: Matrix Multiply": "p2-matrix-multiply",
    }
  }
} as const;

export type OrganizationKey = keyof typeof ORGANIZATIONS;
