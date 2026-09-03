export interface InterviewMemory {
  sessionId: string;

  /** 当前记忆的对话轮次，因为是异步更新的，需要用这个来匹配对话 */
  conversationIndex: number,

  /** 上一轮对话内容，用于回溯和上下文理解 */
  lastConversation: string,

  /** 候选人的基本信息和自我介绍 */
  candidateIntroduction: string;

  /** 面试官已经问过的问题（按顺序记录） */
  askedQuestions: string[];

  /** 对候选人各项能力的评价 */
  candidateEvaluation: {
    /** 技术能力评价 */
    technicalSkills: string;
    /** 问题解决能力 */
    problemSolving: string;
    /** 沟通表达能力 */
    communication: string;
    /** 编码风格或代码质量 */
    codingStyle?: string;
    /** 总体印象 */
    overallImpression: string;
  };

  /** 面试摘要：总结整个过程，比如面试重点、表现亮点或不足 */
  interviewSummary: string;

  /** 特别备注：如迟到、网络问题、态度问题、需进一步确认的信息等 */
  additionalNotes: string[];

  /** 最后更新时间戳 */
  lastUpdateTime: number;
}

export function createInterviewMemory(sessionId: string): InterviewMemory {
  return {
    sessionId,
    conversationIndex: 0,
    lastConversation: '',
    candidateIntroduction: '',
    askedQuestions: [],
    candidateEvaluation: {
      technicalSkills: '',
      problemSolving: '',
      communication: '',
      codingStyle: '',
      overallImpression: '',
    },
    interviewSummary: '',
    additionalNotes: [],
    lastUpdateTime: Date.now(),
  }
}
