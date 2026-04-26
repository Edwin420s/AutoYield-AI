import { ethers } from 'ethers';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

/**
 * Comprehensive Trust Scoring Engine for DeFi Protocols
 * This service implements enterprise-grade risk assessment with dynamic allocation limits
 * based on multiple factors: security, financial health, market performance, and governance.
 */

class TrustScoringService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Scoring weights (configurable)
    this.weights = {
      security: 0.35,      // 35% - Security audits, bug bounties, track record
      financial: 0.25,     // 25% - TVL, revenue, sustainability
      market: 0.20,        // 20% - Volume, liquidity, user base
      governance: 0.15,    // 15% - DAO, team transparency, community
      technical: 0.05      // 5% - Code quality, documentation, innovation
    };
    
    // Risk thresholds for dynamic allocation limits
    this.allocationLimits = {
      excellent: { minScore: 85, maxAllocation: 50, color: 'green' },
      good: { minScore: 70, maxAllocation: 35, color: 'blue' },
      moderate: { minScore: 55, maxAllocation: 20, color: 'yellow' },
      poor: { minScore: 40, maxAllocation: 10, color: 'orange' },
      highRisk: { minScore: 0, maxAllocation: 5, color: 'red' }
    };
  }

  /**
   * Calculate comprehensive trust score for a DeFi protocol
   * @param {Object} protocolData - Protocol information
   * @returns {Promise<Object>} - Trust score and breakdown
   */
  async calculateTrustScore(protocolData) {
    try {
      console.log(`🔍 Calculating trust score for ${protocolData.name}...`);

      // 1. Security Assessment (35%)
      const securityScore = await this.assessSecurity(protocolData);
      
      // 2. Financial Health (25%)
      const financialScore = await this.assessFinancialHealth(protocolData);
      
      // 3. Market Performance (20%)
      const marketScore = await this.assessMarketPerformance(protocolData);
      
      // 4. Governance Quality (15%)
      const governanceScore = await this.assessGovernance(protocolData);
      
      // 5. Technical Excellence (5%)
      const technicalScore = await this.assessTechnicalExcellence(protocolData);

      // Calculate weighted total score
      const totalScore = 
        (securityScore.score * this.weights.security) +
        (financialScore.score * this.weights.financial) +
        (marketScore.score * this.weights.market) +
        (governanceScore.score * this.weights.governance) +
        (technicalScore.score * this.weights.technical);

      // Determine allocation limits based on score
      const allocationLimit = this.getAllocationLimit(totalScore);
      
      // Generate detailed report
      const trustReport = {
        protocol: protocolData.name,
        address: protocolData.address,
        totalScore: Math.round(totalScore),
        grade: this.getGrade(totalScore),
        allocationLimit: allocationLimit,
        breakdown: {
          security: securityScore,
          financial: financialScore,
          market: marketScore,
          governance: governanceScore,
          technical: technicalScore
        },
        riskFactors: this.identifyRiskFactors(securityScore, financialScore, marketScore),
        recommendations: this.generateRecommendations(totalScore, allocationLimit),
        lastUpdated: new Date().toISOString(),
        confidence: this.calculateConfidence(securityScore, financialScore, marketScore)
      };

      console.log(`✅ Trust score calculated: ${trustReport.totalScore}/100 (${trustReport.grade})`);
      return trustReport;

    } catch (error) {
      console.error(`❌ Trust scoring failed for ${protocolData.name}:`, error);
      throw new Error(`Trust scoring failed: ${error.message}`);
    }
  }

  /**
   * Assess security aspects of the protocol
   * @param {Object} protocolData - Protocol data
   * @returns {Promise<Object>} - Security assessment
   */
  async assessSecurity(protocolData) {
    let score = 0;
    const factors = [];

    // Audit History (40% of security score)
    if (protocolData.audits && protocolData.audits.length > 0) {
      const auditScore = this.scoreAuditHistory(protocolData.audits);
      score += auditScore * 0.4;
      factors.push(`Audit History: ${auditScore}/100`);
    } else {
      factors.push('❌ No security audits found');
    }

    // Bug Bounty Program (25% of security score)
    if (protocolData.bugBounty) {
      const bountyScore = this.scoreBugBounty(protocolData.bugBounty);
      score += bountyScore * 0.25;
      factors.push(`Bug Bounty: ${bountyScore}/100`);
    } else {
      factors.push('❌ No bug bounty program');
    }

    // Security Track Record (25% of security score)
    if (protocolData.securityIncidents) {
      const trackRecordScore = this.scoreSecurityTrackRecord(protocolData.securityIncidents);
      score += trackRecordScore * 0.25;
      factors.push(`Track Record: ${trackRecordScore}/100`);
    } else {
      // No incidents is good, but we need some history
      score += 70 * 0.25; // Neutral score
      factors.push('⚠️ Limited security history');
    }

    // Insurance Coverage (10% of security score)
    if (protocolData.insurance) {
      const insuranceScore = this.scoreInsuranceCoverage(protocolData.insurance);
      score += insuranceScore * 0.1;
      factors.push(`Insurance: ${insuranceScore}/100`);
    } else {
      factors.push('❌ No insurance coverage');
    }

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      weight: this.weights.security * 100
    };
  }

  /**
   * Assess financial health of the protocol
   * @param {Object} protocolData - Protocol data
   * @returns {Promise<Object>} - Financial assessment
   */
  async assessFinancialHealth(protocolData) {
    let score = 0;
    const factors = [];

    // TVL Sustainability (30% of financial score)
    if (protocolData.tvl && protocolData.tvlHistory) {
      const tvlScore = this.scoreTVLSustainability(protocolData.tvl, protocolData.tvlHistory);
      score += tvlScore * 0.3;
      factors.push(`TVL Sustainability: ${tvlScore}/100`);
    } else {
      factors.push('❌ Insufficient TVL data');
    }

    // Revenue Generation (25% of financial score)
    if (protocolData.revenue) {
      const revenueScore = this.scoreRevenue(protocolData.revenue, protocolData.tvl);
      score += revenueScore * 0.25;
      factors.push(`Revenue: ${revenueScore}/100`);
    } else {
      factors.push('❌ No revenue data');
    }

    // Treasury Health (20% of financial score)
    if (protocolData.treasury) {
      const treasuryScore = this.scoreTreasuryHealth(protocolData.treasury);
      score += treasuryScore * 0.2;
      factors.push(`Treasury: ${treasuryScore}/100`);
    } else {
      factors.push('❌ No treasury data');
    }

    // Token Economics (15% of financial score)
    if (protocolData.tokenomics) {
      const tokenomicsScore = this.scoreTokenomics(protocolData.tokenomics);
      score += tokenomicsScore * 0.15;
      factors.push(`Tokenomics: ${tokenomicsScore}/100`);
    } else {
      factors.push('⚠️ Limited tokenomics data');
    }

    // Profitability (10% of financial score)
    if (protocolData.profitability) {
      const profitScore = this.scoreProfitability(protocolData.profitability);
      score += profitScore * 0.1;
      factors.push(`Profitability: ${profitScore}/100`);
    } else {
      factors.push('❌ No profitability data');
    }

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      weight: this.weights.financial * 100
    };
  }

  /**
   * Assess market performance metrics
   * @param {Object} protocolData - Protocol data
   * @returns {Promise<Object>} - Market assessment
   */
  async assessMarketPerformance(protocolData) {
    let score = 0;
    const factors = [];

    // Trading Volume (30% of market score)
    if (protocolData.volume24h) {
      const volumeScore = this.scoreTradingVolume(protocolData.volume24h, protocolData.tvl);
      score += volumeScore * 0.3;
      factors.push(`Volume: ${volumeScore}/100`);
    } else {
      factors.push('❌ No volume data');
    }

    // User Base Growth (25% of market score)
    if (protocolData.users && protocolData.userHistory) {
      const userScore = this.scoreUserGrowth(protocolData.users, protocolData.userHistory);
      score += userScore * 0.25;
      factors.push(`User Growth: ${userScore}/100`);
    } else {
      factors.push('❌ No user data');
    }

    // Market Share (20% of market score)
    if (protocolData.marketShare) {
      const shareScore = this.scoreMarketShare(protocolData.marketShare);
      score += shareScore * 0.2;
      factors.push(`Market Share: ${shareScore}/100`);
    } else {
      factors.push('⚠️ Limited market share data');
    }

    // Liquidity Depth (15% of market score)
    if (protocolData.liquidity) {
      const liquidityScore = this.scoreLiquidity(protocolData.liquidity, protocolData.tvl);
      score += liquidityScore * 0.15;
      factors.push(`Liquidity: ${liquidityScore}/100`);
    } else {
      factors.push('❌ No liquidity data');
    }

    // Price Stability (10% of market score)
    if (protocolData.priceHistory) {
      const stabilityScore = this.scorePriceStability(protocolData.priceHistory);
      score += stabilityScore * 0.1;
      factors.push(`Price Stability: ${stabilityScore}/100`);
    } else {
      factors.push('❌ No price history');
    }

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      weight: this.weights.market * 100
    };
  }

  /**
   * Assess governance quality
   * @param {Object} protocolData - Protocol data
   * @returns {Promise<Object>} - Governance assessment
   */
  async assessGovernance(protocolData) {
    let score = 0;
    const factors = [];

    // DAO Structure (30% of governance score)
    if (protocolData.dao) {
      const daoScore = this.scoreDAOStructure(protocolData.dao);
      score += daoScore * 0.3;
      factors.push(`DAO: ${daoScore}/100`);
    } else {
      factors.push('❌ No DAO structure');
    }

    // Team Transparency (25% of governance score)
    if (protocolData.team) {
      const teamScore = this.scoreTeamTransparency(protocolData.team);
      score += teamScore * 0.25;
      factors.push(`Team: ${teamScore}/100`);
    } else {
      factors.push('❌ No team information');
    }

    // Community Engagement (20% of governance score)
    if (protocolData.community) {
      const communityScore = this.scoreCommunityEngagement(protocolData.community);
      score += communityScore * 0.2;
      factors.push(`Community: ${communityScore}/100`);
    } else {
      factors.push('❌ No community data');
    }

    // Voting Participation (15% of governance score)
    if (protocolData.voting) {
      const votingScore = this.scoreVotingParticipation(protocolData.voting);
      score += votingScore * 0.15;
      factors.push(`Voting: ${votingScore}/100`);
    } else {
      factors.push('❌ No voting data');
    }

    // Regulatory Compliance (10% of governance score)
    if (protocolData.compliance) {
      const complianceScore = this.scoreRegulatoryCompliance(protocolData.compliance);
      score += complianceScore * 0.1;
      factors.push(`Compliance: ${complianceScore}/100`);
    } else {
      factors.push('⚠️ Limited compliance info');
    }

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      weight: this.weights.governance * 100
    };
  }

  /**
   * Assess technical excellence
   * @param {Object} protocolData - Protocol data
   * @returns {Promise<Object>} - Technical assessment
   */
  async assessTechnicalExcellence(protocolData) {
    let score = 0;
    const factors = [];

    // Code Quality (30% of technical score)
    if (protocolData.codeQuality) {
      const codeScore = this.scoreCodeQuality(protocolData.codeQuality);
      score += codeScore * 0.3;
      factors.push(`Code Quality: ${codeScore}/100`);
    } else {
      factors.push('❌ No code quality assessment');
    }

    // Documentation (25% of technical score)
    if (protocolData.documentation) {
      const docsScore = this.scoreDocumentation(protocolData.documentation);
      score += docsScore * 0.25;
      factors.push(`Documentation: ${docsScore}/100`);
    } else {
      factors.push('❌ Poor documentation');
    }

    // Innovation (20% of technical score)
    if (protocolData.innovation) {
      const innovationScore = this.scoreInnovation(protocolData.innovation);
      score += innovationScore * 0.2;
      factors.push(`Innovation: ${innovationScore}/100`);
    } else {
      factors.push('⚠️ Limited innovation');
    }

    // Integration Ecosystem (15% of technical score)
    if (protocolData.integrations) {
      const integrationScore = this.scoreIntegrations(protocolData.integrations);
      score += integrationScore * 0.15;
      factors.push(`Integrations: ${integrationScore}/100`);
    } else {
      factors.push('❌ Limited integrations');
    }

    // Performance (10% of technical score)
    if (protocolData.performance) {
      const performanceScore = this.scorePerformance(protocolData.performance);
      score += performanceScore * 0.1;
      factors.push(`Performance: ${performanceScore}/100`);
    } else {
      factors.push('❌ No performance data');
    }

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      weight: this.weights.technical * 100
    };
  }

  /**
   * Get allocation limit based on trust score
   * @param {number} score - Trust score (0-100)
   * @returns {Object} - Allocation limit details
   */
  getAllocationLimit(score) {
    for (const [category, limit] of Object.entries(this.allocationLimits)) {
      if (score >= limit.minScore) {
        return {
          category,
          maxAllocation: limit.maxAllocation,
          color: limit.color,
          description: this.getAllocationDescription(category, limit)
        };
      }
    }
    
    return this.allocationLimits.highRisk;
  }

  /**
   * Get grade based on score
   * @param {number} score - Trust score
   * @returns {string} - Grade (A+, A, B+, B, C+, C, D, F)
   */
  getGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Identify risk factors based on assessment
   * @param {Object} security - Security assessment
   * @param {Object} financial - Financial assessment
   * @param {Object} market - Market assessment
   * @returns {Array} - Risk factors
   */
  identifyRiskFactors(security, financial, market) {
    const risks = [];

    if (security.score < 60) risks.push('🔒 Security concerns detected');
    if (financial.score < 50) risks.push('💰 Financial health issues');
    if (market.score < 40) risks.push('📉 Poor market performance');
    if (security.score < 40) risks.push('🚨 High security risk');
    if (financial.score < 30) risks.push('⚠️ Financial instability');

    return risks;
  }

  /**
   * Generate recommendations based on score and allocation
   * @param {number} score - Trust score
   * @param {Object} allocation - Allocation limit
   * @returns {Array} - Recommendations
   */
  generateRecommendations(score, allocation) {
    const recommendations = [];

    if (score >= 85) {
      recommendations.push('✅ High confidence - suitable for large allocations');
      recommendations.push('📈 Consider for core portfolio position');
    } else if (score >= 70) {
      recommendations.push('⚖️ Moderate confidence - diversify position');
      recommendations.push('👀 Monitor closely for changes');
    } else if (score >= 55) {
      recommendations.push('⚠️ Low confidence - small allocation only');
      recommendations.push('🔍 Increased monitoring required');
    } else {
      recommendations.push('❌ Very low confidence - avoid or minimal exposure');
      recommendations.push('🚨 High risk - not recommended for most portfolios');
    }

    if (allocation.maxAllocation <= 10) {
      recommendations.push('📊 Limit to speculative portion of portfolio');
    }

    return recommendations;
  }

  /**
   * Calculate confidence level in the assessment
   * @param {Object} security - Security assessment
   * @param {Object} financial - Financial assessment
   * @param {Object} market - Market assessment
   * @returns {number} - Confidence score (0-100)
   */
  calculateConfidence(security, financial, market) {
    const dataQuality = [
      security.factors.length,
      financial.factors.length,
      market.factors.length
    ].reduce((sum, count) => sum + count, 0) / 15; // Max 15 factors total

    const scoreConsistency = [
      security.score,
      financial.score,
      market.score
    ].reduce((sum, score) => sum + score, 0) / 3;

    return Math.round((dataQuality * 0.6 + (scoreConsistency / 100) * 0.4) * 100);
  }

  // Helper scoring methods (simplified for demo)
  scoreAuditHistory(audits) {
    if (!audits || audits.length === 0) return 0;
    const recentAudits = audits.filter(a => a.date > Date.now() - 365 * 24 * 60 * 60 * 1000);
    const topFirms = ['Certik', 'OpenZeppelin', 'ConsenSys Diligence', 'Trail of Bits'];
    const hasTopFirm = audits.some(a => topFirms.includes(a.firm));
    const noCritical = audits.every(a => a.criticalIssues === 0);
    
    let score = 50;
    if (recentAudits.length > 0) score += 20;
    if (hasTopFirm) score += 20;
    if (noCritical) score += 10;
    
    return Math.min(100, score);
  }

  scoreBugBounty(bounty) {
    if (!bounty) return 0;
    let score = 30;
    if (bounty.maxPayout > 100000) score += 30;
    if (bounty.active) score += 20;
    if (bounty.paidOut > 0) score += 20;
    return Math.min(100, score);
  }

  scoreSecurityTrackRecord(incidents) {
    if (!incidents || incidents.length === 0) return 80;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const recentIncidents = incidents.filter(i => i.date > Date.now() - 365 * 24 * 60 * 60 * 1000).length;
    
    let score = 80;
    score -= criticalIncidents * 30;
    score -= recentIncidents * 15;
    
    return Math.max(0, score);
  }

  scoreInsuranceCoverage(insurance) {
    if (!insurance) return 0;
    let score = 40;
    if (insurance.coverage > 10000000) score += 30;
    if (insurance.active) score += 20;
    if (insurance.provider === 'Nexus Mutual') score += 10;
    return Math.min(100, score);
  }

  scoreTVLSustainability(tvl, history) {
    if (!tvl || !history) return 50;
    // Simple scoring based on TVL stability
    const avgTVL = history.reduce((sum, h) => sum + h.tvl, 0) / history.length;
    const volatility = Math.abs(tvl - avgTVL) / avgTVL;
    
    let score = 70;
    if (volatility < 0.1) score += 30;
    else if (volatility < 0.2) score += 15;
    else score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  scoreRevenue(revenue, tvl) {
    if (!revenue || !tvl) return 0;
    const revenueRatio = (revenue.annual / tvl) * 100;
    
    if (revenueRatio > 5) return 90;
    if (revenueRatio > 2) return 75;
    if (revenueRatio > 1) return 60;
    if (revenueRatio > 0.5) return 40;
    return 20;
  }

  scoreTreasuryHealth(treasury) {
    if (!treasury) return 50;
    let score = 60;
    if (treasury.diversified) score += 20;
    if (treasury.yearsOfRunway > 3) score += 20;
    return Math.min(100, score);
  }

  scoreTokenomics(tokenomics) {
    if (!tokenomics) return 50;
    let score = 60;
    if (tokenomics.inflationRate < 0.05) score += 20;
    if (tokenomics.vestingPeriod > 365) score += 20;
    return Math.min(100, score);
  }

  scoreProfitability(profitability) {
    if (!profitability) return 0;
    if (profitability.netMargin > 0.2) return 90;
    if (profitability.netMargin > 0.1) return 75;
    if (profitability.netMargin > 0) return 60;
    return 30;
  }

  scoreTradingVolume(volume24h, tvl) {
    if (!volume24h || !tvl) return 50;
    const volumeRatio = (volume24h * 365) / tvl;
    
    if (volumeRatio > 10) return 90;
    if (volumeRatio > 5) return 75;
    if (volumeRatio > 2) return 60;
    if (volumeRatio > 1) return 45;
    return 30;
  }

  scoreUserGrowth(users, history) {
    if (!users || !history) return 50;
    const growthRate = (users - history[0].users) / history[0].users;
    
    if (growthRate > 0.5) return 90;
    if (growthRate > 0.2) return 75;
    if (growthRate > 0) return 60;
    return 30;
  }

  scoreMarketShare(share) {
    if (!share) return 50;
    if (share > 0.3) return 90;
    if (share > 0.1) return 75;
    if (share > 0.05) return 60;
    if (share > 0.01) return 45;
    return 30;
  }

  scoreLiquidity(liquidity, tvl) {
    if (!liquidity || !tvl) return 50;
    const ratio = liquidity / tvl;
    
    if (ratio > 0.1) return 90;
    if (ratio > 0.05) return 75;
    if (ratio > 0.02) return 60;
    return 40;
  }

  scorePriceStability(priceHistory) {
    if (!priceHistory || priceHistory.length < 30) return 50;
    
    const prices = priceHistory.slice(-30);
    const volatility = this.calculateVolatility(prices);
    
    if (volatility < 0.1) return 90;
    if (volatility < 0.2) return 75;
    if (volatility < 0.3) return 60;
    return 40;
  }

  scoreDAOStructure(dao) {
    if (!dao) return 0;
    let score = 40;
    if (dao.active) score += 30;
    if (dao.quorum < 0.1) score += 20;
    if (dao.votingPeriod < 7 * 24 * 60 * 60 * 1000) score += 10;
    return Math.min(100, score);
  }

  scoreTeamTransparency(team) {
    if (!team) return 0;
    let score = 40;
    if (team.doxed) score += 30;
    if (team.experience > 5) score += 20;
    if (team.size > 5) score += 10;
    return Math.min(100, score);
  }

  scoreCommunityEngagement(community) {
    if (!community) return 0;
    let score = 40;
    if (community.discordMembers > 10000) score += 30;
    if (community.twitterFollowers > 50000) score += 20;
    if (community.activeProposals > 10) score += 10;
    return Math.min(100, score);
  }

  scoreVotingParticipation(voting) {
    if (!voting) return 0;
    if (voting.participationRate > 0.3) return 90;
    if (voting.participationRate > 0.2) return 75;
    if (voting.participationRate > 0.1) return 60;
    return 40;
  }

  scoreRegulatoryCompliance(compliance) {
    if (!compliance) return 50;
    let score = 60;
    if (compliance.licensed) score += 20;
    if (compliance.kyc) score += 20;
    return Math.min(100, score);
  }

  scoreCodeQuality(codeQuality) {
    if (!codeQuality) return 50;
    let score = 60;
    if (codeQuality.testCoverage > 0.8) score += 20;
    if (codeQuality.noCriticalBugs) score += 20;
    return Math.min(100, score);
  }

  scoreDocumentation(documentation) {
    if (!documentation) return 0;
    let score = 40;
    if (documentation.comprehensive) score += 30;
    if (documentation.upToDate) score += 20;
    if (documentation.tutorials) score += 10;
    return Math.min(100, score);
  }

  scoreInnovation(innovation) {
    if (!innovation) return 50;
    let score = 60;
    if (innovation.patents > 0) score += 20;
    if (innovation.uniqueFeatures > 3) score += 20;
    return Math.min(100, score);
  }

  scoreIntegrations(integrations) {
    if (!integrations) return 0;
    let score = 40;
    if (integrations.length > 10) score += 30;
    if (integrations.length > 5) score += 20;
    if (integrations.length > 2) score += 10;
    return Math.min(100, score);
  }

  scorePerformance(performance) {
    if (!performance) return 50;
    let score = 60;
    if (performance.gasEfficiency > 0.8) score += 20;
    if (performance.responseTime < 1000) score += 20;
    return Math.min(100, score);
  }

  calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  getAllocationDescription(category, limit) {
    const descriptions = {
      excellent: `Maximum ${limit.maxAllocation}% allocation - Excellent trust score`,
      good: `Maximum ${limit.maxAllocation}% allocation - Good trust score`,
      moderate: `Maximum ${limit.maxAllocation}% allocation - Moderate trust score`,
      poor: `Maximum ${limit.maxAllocation}% allocation - Poor trust score`,
      highRisk: `Maximum ${limit.maxAllocation}% allocation - High risk protocol`
    };
    
    return descriptions[category];
  }

  /**
   * Batch score multiple protocols
   * @param {Array} protocols - Array of protocol data
   * @returns {Promise<Array>} - Array of trust scores
   */
  async batchScoreProtocols(protocols) {
    console.log(`📦 Starting batch trust scoring for ${protocols.length} protocols...`);
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < protocols.length; i++) {
      const protocol = protocols[i];
      console.log(`Progress: ${i + 1}/${protocols.length} - Scoring ${protocol.name}`);
      
      try {
        const score = await this.calculateTrustScore(protocol);
        results.push({
          name: protocol.name,
          address: protocol.address,
          success: true,
          ...score
        });
      } catch (error) {
        console.error(`Failed to score ${protocol.name}:`, error);
        results.push({
          name: protocol.name,
          address: protocol.address,
          success: false,
          error: error.message
        });
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const successful = results.filter(r => r.success).length;
    
    console.log(`✅ Batch scoring complete: ${successful}/${protocols.length} protocols scored in ${duration}s`);
    
    return results;
  }
}

export default TrustScoringService;
