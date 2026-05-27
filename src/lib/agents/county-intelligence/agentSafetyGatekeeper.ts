import { loadAgentSafetyPolicyMap } from "./campaignBrainAgentRegistry";

export function agentSafetyGatekeeper(action: string) {
  const policies = loadAgentSafetyPolicyMap().policies;
  const blockedBy = policies.filter((policy) =>
    policy.blockedActions.some((blocked) => action.toLowerCase().includes(blocked.toLowerCase())),
  );
  return {
    action,
    allowed: blockedBy.length === 0,
    blockedByPolicies: blockedBy.map((x) => x.policyId),
  };
}

