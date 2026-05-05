// Mock database service for demo purposes
// In production, this would integrate with PostgreSQL or MongoDB

// In-memory storage for demo
let proposals = [];

// Function to set proposals array (called by contractService to avoid circular dependency)
export function setProposalsArray(proposalsArray) {
  proposals = proposalsArray;
}

/**
 * Update proposal status in database
 * @param {number} proposalId - Proposal ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateProposalStatus(proposalId, updates) {
  console.log(`Updating proposal ${proposalId} with:`, updates);
  
  // For demo: Update proposal in memory array
  const proposal = proposals.find(p => p.id === proposalId);
  if (proposal) {
    Object.assign(proposal, updates);
    console.log(`Proposal ${proposalId} updated in memory:`, proposal);
    return true;
  }
  
  return false;
}

/**
 * Get all proposals from database
 * @returns {Promise<Array>} Array of proposals
 */
export async function getAllProposals() {
  return proposals;
}

/**
 * Add proposal to database
 * @param {Object} proposal - Proposal object
 * @returns {Promise<Object>} Added proposal
 */
export async function addProposal(proposal) {
  proposals.push(proposal);
  return proposal;
}

/**
 * Set proposals array (for initialization)
 * @param {Array} proposalList - Array of proposals
 */
export function setProposals(proposalList) {
  proposals = proposalList;
}
