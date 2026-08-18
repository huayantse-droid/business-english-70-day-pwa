const titles = [
  '商务邮件',
  '视频会议',
  '客户来访接待',
  '商务谈判与报价',
  '项目进度汇报',
  '技术方案说明',
  '会议主持与 Facilitation',
  '管理层战略汇报',
  '跨文化危机处理',
  '行业演讲与国际展会'
];

const cycleDefinitions = [
  {
    scene: '给欧美客户发送项目进度更新邮件',
    material: `Subject: Project Update – Apex Motors Project Aurora | Week 18

Dear Ms. Taylor,

I hope this email finds you well. I am writing to provide a brief update on the Apex Motors Project Aurora interface module, which we discussed in our last video conference earlier this month.

First, I am pleased to inform you that the hardware design review was completed successfully on schedule. Our engineering team has finalized the PCB layout, and all critical components have passed the preliminary reliability tests. Please find the updated design specification attached for your reference.

Second, regarding the EMC pre-scan that you raised concerns about during our last meeting, we have conducted additional simulation runs. The results show that we are within the acceptable margin for CISPR 25 Class 5 requirements. A detailed simulation report will be shared with you by this Friday.

Third, we would like to schedule the next checkpoint meeting in the second week of next month. Would Tuesday at 10:00 AM in your local time work for your team? Please let us know your availability, and we will send out the calendar invitation accordingly.

If you have any questions or need further clarification on any of the items above, please do not hesitate to contact me. Thank you for your continued support and collaboration.

Best regards,
Alex Chen
Program Manager, Global Programs Department
Northstar Mobility`,
    expressions: [
      ['I hope this email finds you well.', '邮件开头寒暄'],
      ['I am writing to provide a brief update on...', '说明邮件目的'],
      ['I am pleased to inform you that...', '传递好消息'],
      ['Please find... attached for your reference.', '附件说明'],
      ['Regarding..., we have conducted...', '回应对方关切'],
      ['Would [date] at [time] work for your team?', '提议会议时间'],
      ['Please do not hesitate to contact me.', '邮件结尾']
    ],
    outputScenario: `你负责BluePeak Automotive的Project Cedar项目，刚刚完成了客户要求的设计变更评审，需要给客户项目负责人Ms. Rivera发一封英文邮件汇报进展。

要求：使用至少3个核心表达；包含设计变更评审已完成、测试结果符合要求、请求确认下次会议时间；长度80-120词。`
  },
  {
    scene: '项目同步视频会议开场',
    material: `Good morning, everyone. Thank you for joining today’s project sync meeting. I appreciate you making time, especially given the time zone differences between our teams across Asia and Europe.

Let’s start with a quick roll call. From Northstar Mobility, we have myself, Alex Chen, together with our hardware lead Jordan and software manager Morgan. From Orion Components, I see Taylor and Casey have joined. Welcome, everyone.

Today’s agenda has four main items. First, we will review the action items from our previous meeting. Second, our engineering team will walk you through the latest EMC simulation results. Third, we need to align on the revised milestone schedule for the prototype delivery. And fourth, we will open the floor for any questions or concerns from both sides.

I would like to keep this meeting within 45 minutes so that everyone can get back to their work. If we need to go deeper on any specific topic, I suggest we schedule a separate technical breakout session.

Before we move to the first item, does anyone have anything urgent to add to the agenda? If not, let’s begin with the action item review. Jordan, could you please take us through the updates?`,
    expressions: [
      ['Thank you for joining today’s... meeting.', '感谢参会'],
      ['Let’s start with a quick roll call.', '点名'],
      ['Today’s agenda has four main items.', '介绍议程'],
      ['We will open the floor for any questions.', '开放提问'],
      ['I would like to keep this meeting within...', '控制时间'],
      ['Does anyone have anything urgent to add?', '确认议程']
    ],
    outputScenario: '主持一场与欧美供应商的英文视频会议，介绍会议议程并控制时间在45分钟内。'
  },
  {
    scene: '在公司大堂接待首次来访的欧美客户',
    material: `Good afternoon! You must be Ms. Parker from Orion Components. Welcome to Northstar Mobility. I am Alex Chen, Program Manager in the Global Programs Department. It is a pleasure to finally meet you in person. I have heard many good things about your team from our colleagues in Europe.

I hope your flight was comfortable. The weather near our headquarters is quite warm this time of year, quite different from what you are used to, I imagine. Please, let me take your luggage. Our car is waiting just outside.

The drive to our headquarters will take about 35 minutes. On the way, I would be happy to give you a brief introduction to our company. Northstar Mobility was founded more than two decades ago and has grown into a global automotive electronics supplier. We specialize in smart cockpit solutions, including instrument clusters, head-up displays, and infotainment systems. Last year, our international business achieved double-digit growth.

For today’s visit, we have arranged a full schedule. First, we will have lunch at our staff restaurant so you can experience some local cuisine. Then in the early afternoon, we will start with a tour of our state-of-the-art manufacturing plant, where you can see our automated SMT lines and testing facilities. After that, we will move to the conference room for technical discussions with our R&D team.

Is there anything specific you would like to see or anyone you would particularly like to meet during this visit? We want to make sure your time here is as productive and enjoyable as possible.`,
    expressions: [
      ['It is a pleasure to finally meet you in person.', '初次见面'],
      ['I hope your flight from... was comfortable.', '关心旅途'],
      ['I would be happy to give you a brief introduction to...', '公司介绍开场'],
      ['We have arranged a full schedule.', '行程安排'],
      ['Is there anything specific you would like to see?', '询问需求']
    ],
    outputScenario: '在公司大堂接待一位欧美客户，完成欢迎、公司介绍和行程说明的15分钟英文对话。'
  },
  {
    scene: '与欧美Tier 1供应商谈判connector单价',
    material: `Thank you for coming in today, Ms. Morgan. I appreciate you making the trip from your regional office to meet with us. Let’s get straight to business.

We have reviewed your quotation for the high-speed connector, reference number QN-1847, issued earlier this month. Your quoted unit price is 5.20 US dollars per piece, based on an annual volume of 48,000 units. While we recognize the quality and reliability of your products, I have to be honest with you — this price point is significantly higher than our current budget allocation for this component.

To give you some context, we are competing for a large-scale program with a global automaker. The target cost for the entire BOM is extremely tight. If we accept your quotation as it stands, our gross margin on this project would fall below the acceptable threshold.

Here is what I am proposing. We would like to request a tiered pricing structure. For the first 28,000 units annually, we accept 4.80 dollars. If our volume reaches 48,000 units, the price drops to 4.45. And if we exceed 75,000 units, we would expect 4.10. In return, we are willing to commit to a two-year supply agreement with guaranteed minimum orders.

Additionally, we would like to discuss the payment terms. Your current request is payment within 30 days. Given the long-term nature of this partnership, we would prefer net 60 days, starting from the date of goods receipt.

I understand this is a lot to take in. Please take this proposal back to your management and let us know your position by the end of this week. I believe we can find a win-win solution here.`,
    expressions: [
      ['Let’s get straight to business.', '切入正题'],
      ['I have to be honest with you...', '坦诚表达'],
      ['To give you some context...', '提供背景'],
      ['Here is what I am proposing.', '提出方案'],
      ['In return, we are willing to commit to...', '交换条件'],
      ['I believe we can find a win-win solution.', '寻求共赢']
    ],
    outputScenario: '与欧美供应商谈判connector单价，使用tiered pricing和付款条件进行谈判。'
  },
  {
    scene: '向管理层汇报Project Nova跨域项目状态',
    material: `Good morning, everyone. Thank you for attending this monthly project review. I am Alex Chen, and I will be presenting the current status of the Project Nova cross-domain cockpit program.

Overall project health: YELLOW. We are making solid progress, but there are two areas that require management attention.

First, the good news. The system architecture design was approved by the customer three days ahead of the committed milestone. Our hardware team has completed the initial schematic design, and the software team has finished the baseline version of the middleware layer. Both deliverables passed internal quality gates without major findings.

Second, the concerns. The EMC pre-scan conducted last week revealed a margin issue in the 180 MHz band. Our simulation team is working closely with the component supplier to identify the root cause. Current estimation is that this will require a PCB layout modification, which could push the prototype delivery date by approximately ten business days.

Third, the risk items. We are still waiting for the final approval of the tooling budget from the finance department. If this is not resolved before the next gate review, we may face a one-week delay in the plastic injection mold kickoff. I have escalated this to the finance director, but I would appreciate it if this committee could add some weight to the request.

Looking ahead to next month, our top priorities are: one, close the EMC issue and update the customer before the next checkpoint; two, secure tooling budget approval; and three, complete the first prototype build for internal validation.

That concludes my update. I am happy to take any questions.`,
    expressions: [
      ['Overall project health: GREEN/YELLOW/RED.', '项目状态'],
      ['We are making solid progress, but...', '转折汇报'],
      ['Current estimation is that...', '预估说明'],
      ['We may face a delay in...', '风险提示'],
      ['I would appreciate it if...', '请求支持'],
      ['Looking ahead, our top priorities are...', '前瞻规划']
    ],
    outputScenario: '用英文向管理层汇报Project Horizon的当前状态、风险和下一步计划。'
  },
  {
    scene: '向非技术背景客户经理解释统一座舱计算技术方案',
    material: `Thank you for your time today. I know you have a busy schedule, so I will keep this explanation focused and practical.

Let me start with a simple analogy. Think of the Unified Cockpit Controller, or UCC, as the brain of your car’s cockpit. Just like a smartphone has one main processor that handles your apps, your calls, and your camera, the UCC is the single computer that coordinates everything you see and touch in the dashboard — the center screen, the instrument panel behind the steering wheel, and the head-up display on the windshield.

Now, what makes our Unified Cockpit Platform special? The key advantage is consolidation. Traditionally, each display in the car had its own separate computer. That means three computers, three power supplies, three cooling systems, and three sets of wiring. With our unified solution, we combine all of this into one single unit.

What does this mean for your business? Three things. First, cost reduction. You save on hardware because you are buying one computer instead of three. Our calculation shows a 25 to 30 percent reduction in Bill of Material cost. Second, weight savings. One unit is lighter than three. In the electric vehicle era, every gram counts for driving range. Third, and perhaps most importantly, over-the-air update capability. Because everything runs on one platform, you can update all displays simultaneously through a single software push.

I understand this is a significant shift from the traditional architecture your company has used. To help you evaluate, we have prepared a detailed comparison matrix and a live demo unit that you can experience firsthand. Would you like to see the demo now, or do you have any questions about the technical concept first?`,
    expressions: [
      ['Let me start with a simple analogy.', '类比开场'],
      ['Think of... as...', '打比方'],
      ['The key advantage is...', '核心优势'],
      ['What does this mean for your business?', '价值转换'],
      ['Our calculation shows...', '数据支撑'],
      ['To help you evaluate...', '提供工具']
    ],
    outputScenario: '向非技术背景的欧美客户经理解释统一座舱计算平台的优势。'
  },
  {
    scene: '主持跨部门项目Review会议',
    material: `Good afternoon, everyone. Welcome to the monthly program review for Project Cedar. We have representatives from Global Programs, R&D, Quality, and Manufacturing with us today. Thank you all for joining.

Before we begin, a quick reminder. This meeting is scheduled for 60 minutes. I will be watching the time, and if any topic runs over, I may suggest we take it offline or schedule a separate follow-up. Our goal today is alignment and decision-making, not problem-solving every detail in this room.

Let’s start with the agenda. Item one, design status update from R&D. Item two, quality gate readiness report. Item three, manufacturing pilot run plan. Item four, open issues and action items. And item five, any other business.

Let’s move to item one. Jordan from R&D, could you please walk us through the current design status? We agreed last month that the mechanical design would be frozen by now. Are we on track?

Thank you, Jordan. I have a quick clarification. You mentioned that the bezel thickness was adjusted from 2.4 mm to 2.1 mm. Have we confirmed with the customer that this change does not affect their assembly process? If not, I suggest we add that as an action item before we move on.

Let’s move to item two. Morgan from Quality, please share the gate readiness report.

We are now at the 50-minute mark. Let’s wrap up the remaining items efficiently. For the open issues, I see three action items on the board. Let me read them back to confirm ownership and deadlines. Item one, customer confirmation on bezel change — Jordan, due next Tuesday. Item two, tooling schedule alignment — Manufacturing team, due this Friday. Item three, updated DVP&R plan — Quality, due before month-end. Does everyone agree? Any objections?

Thank you all for your active participation. The meeting minutes will be distributed by tomorrow morning. Our next review is scheduled for the middle of next month. Have a productive afternoon.`,
    expressions: [
      ['Our goal today is alignment and decision-making.', '明确目标'],
      ['Could you please walk us through...?', '邀请汇报'],
      ['Are we on track?', '确认进度'],
      ['I have a quick clarification.', '提出疑问'],
      ['Let’s wrap up the remaining items efficiently.', '控制节奏'],
      ['Let me read them back to confirm ownership and deadlines.', '确认行动项']
    ],
    outputScenario: '主持一场60分钟的英文跨部门项目Review会议，完成议程推进和行动项确认。'
  },
  {
    scene: '向事业部总经理汇报海外市场客户关系策略',
    material: `Good morning, Ms. Lee. Thank you for making time in your busy schedule. Today I would like to share our updated strategy for building multi-dimensional relationships with international automakers, and to request your support on two key initiatives.

Situation. Over the past year, our Global Programs team has established active engagement with six international automakers, including Apex Motors, BluePeak Automotive, and four other prospective customers. Collectively, these relationships have generated 43 percent of our division’s new RFQ pipeline. However, our current approach remains largely transactional — we respond to RFQs and manage individual projects, but we lack a systematic framework for elevating these relationships to strategic partnership level.

Complication. Two trends are making this increasingly urgent. First, global automakers are consolidating their supplier base, and one major customer recently announced a plan to reduce tier-one suppliers by roughly one quarter over the next three years. Second, international competitors are aggressively expanding their regional presence, offering bundled cockpit solutions at competitive price points.

Question. How can Northstar Mobility secure a position as a preferred strategic partner, rather than just a project-by-project supplier?

Answer. We propose a three-layer approach. Layer one, operational excellence — flawless execution on every current project, because one quality escape can destroy years of trust-building. Layer two, technology co-creation — inviting key customers to our innovation center for joint workshops on next-generation cockpit concepts, starting with Apex Motors and BluePeak Automotive in the fourth quarter. Layer three, executive relationship program — quarterly business reviews at the VP level, alternating between our Asian and European offices.

To execute this, I am requesting two things. First, approval for an annual customer-innovation budget of 120,000 US dollars. Second, your participation in the first executive meeting with Apex Motors’ purchasing director, tentatively scheduled for the fourth quarter.

I believe this investment will yield measurable returns within 12 months. Thank you, and I welcome your feedback.`,
    expressions: [
      ['I would like to share our updated strategy for...', '开场'],
      ['Our current approach remains largely transactional.', '现状诊断'],
      ['How can we secure a position as...?', '提出问题'],
      ['We propose a three-layer approach.', '方案结构'],
      ['I am requesting two things.', '请求资源'],
      ['I believe this investment will yield measurable returns.', '价值承诺']
    ],
    outputScenario: '用SCQA结构向事业部总经理英文汇报国际客户关系策略。'
  },
  {
    scene: '欧美客户投诉试作品质量问题',
    material: `Ms. Brooks, thank you for calling. I understand this is a frustrating situation, and I want you to know that we are taking this very seriously. Let me make sure I fully understand the issue before we discuss next steps.

So, to confirm: the pilot lot of 180 units, shipped early this month, arrived at your facility last week. During your incoming inspection, your team identified a cosmetic defect on the display bezel — specifically, a visible scratch pattern on approximately 12 percent of the units. The defect is located in the upper right corner, and it appears to be related to the protective film removal process during packaging. Is that correct?

Thank you for the clarification. I have three immediate actions to share with you.

First, I sincerely apologize on behalf of Northstar Mobility. This level of defect is unacceptable, especially on a pilot lot that is meant to build confidence ahead of mass production. I want to assure you that this does not reflect our normal quality standards.

Second, our quality manager and manufacturing director are already on the production line investigating the root cause. We will issue a preliminary 5-Why analysis report within 48 hours, and a complete corrective action report within one week.

Third, regarding the affected units, we propose two options. Option A, we ship 180 replacement units by express air freight at our expense, with enhanced protective packaging. The earliest delivery would be within ten business days. Option B, if your production schedule allows, we can send a technician to your site to sort and, where possible, repair the acceptable units, while simultaneously shipping replacements for the truly defective ones.

I understand that this incident has caused disruption to your validation schedule. We are prepared to discuss reasonable compensation for any direct costs resulting from this delay.

Ms. Brooks, I give you my personal commitment that we will resolve this thoroughly and transparently. May I ask which option you prefer, and are there any other concerns you would like me to address right now?`,
    expressions: [
      ['I understand this is a frustrating situation.', '共情'],
      ['Let me make sure I fully understand the issue.', '确认问题'],
      ['I sincerely apologize on behalf of...', '正式道歉'],
      ['This level of defect is unacceptable.', '定性问题'],
      ['I give you my personal commitment...', '个人承诺'],
      ['We are prepared to discuss reasonable compensation.', '补救方案']
    ],
    outputScenario: '处理欧美客户关于试作品质量投诉的危机沟通电话。'
  },
  {
    scene: '在国际科技展会上向客户介绍虚构智能座舱方案',
    material: `Ladies and gentlemen, welcome to the Northstar Mobility booth. My name is Alex Chen, and I am honored to present our vision for the future of automotive cockpit experiences.

Let me begin with a question. When you get into your car tomorrow morning, what do you want to feel? Do you want to see a cluster of buttons and knobs that looks exactly like the car your parents drove twenty years ago? Or do you want to step into a space that knows you, adapts to you, and makes every journey — whether five minutes or five hours — genuinely enjoyable?

At Northstar Mobility, we believe the cockpit is no longer just a control panel. It is the primary interface between the driver and the vehicle. It is where safety, entertainment, productivity, and emotion converge.

Today, I am excited to introduce our latest concept platform: Horizon Cockpit X. This is not an incremental upgrade. It is a fundamental rethinking of what a cockpit can be.

Here are three things that make it special.

First, seamless multi-screen integration. One brain. Four displays. Zero lag. The center console, the instrument cluster, the head-up display, and the rear entertainment screens — all running on a single powerful computing unit. What this means for the driver is a perfectly synchronized experience. When navigation guidance appears on the center screen, the same directional arrow is projected onto the windshield through the HUD, and the instrument cluster shows a simplified map view. No conflicting information. No mental overload.

Second, AI-powered personalization. Our cockpit learns. It learns your preferred cabin temperature, your favorite music genre, your commuting route, even your stress level through facial recognition. After two weeks of driving, the car knows that on Monday mornings you prefer jazz and 22 degrees Celsius, while Friday evenings call for podcasts and ambient lighting in calming blue. It is not just smart. It is thoughtful.

Third, and this is critical — safety by design. With more screens and more features, distraction is a real risk. Our solution is context-aware interface management. When the vehicle speed exceeds 80 kilometers per hour, non-essential notifications are suppressed. When the driver shows signs of fatigue, the system automatically increases alert prompts and suggests the nearest rest area. Technology should enhance safety, never compromise it.

We are already working with several international automakers to evaluate Horizon Cockpit X for future vehicle programs.

If you would like to experience the live demo, our team is ready at Station Three. And I would be delighted to discuss how we can collaborate to bring this vision to your brand. Thank you.`,
    expressions: [
      ['Let me begin with a question.', '开场钩子'],
      ['This is not an incremental upgrade.', '强调创新'],
      ['Here are three things that make it special.', '结构预告'],
      ['What this means for... is...', '价值转化'],
      ['It is not just smart. It is thoughtful.', '情感升华'],
      ['I would be delighted to discuss how we can collaborate.', '邀请合作']
    ],
    outputScenario: '在国际科技展会上向客户做8-10分钟的虚构智能座舱产品介绍演讲。'
  }
];

const freezeCycle = (cycle) => Object.freeze({
  ...cycle,
  expressions: Object.freeze(cycle.expressions.map(([english, purpose]) => Object.freeze({ english, purpose })))
});

export const cycles = Object.freeze(cycleDefinitions.map((definition, index) => freezeCycle({
  id: index + 1,
  title: titles[index],
  dayStart: index * 7 + 1,
  dayEnd: index * 7 + 7,
  ...definition
})));

export const dayFocus = Object.freeze([
  Object.freeze({ dayInCycle: 1, title: '盲听与逐句听写', instruction: '盲听+逐句听写', acceptance: '完整度80%+，商务短语拼写正确' }),
  Object.freeze({ dayInCycle: 2, title: '对照原文纠错与查生词', instruction: '对照原文纠错+查生词', acceptance: '生词释义准确，理解句子结构' }),
  Object.freeze({ dayInCycle: 3, title: '背诵第一阶段', instruction: '背诵-第一阶段', acceptance: '能脱稿说出大意，核心表达准确' }),
  Object.freeze({ dayInCycle: 4, title: '背诵第二阶段与跟读', instruction: '背诵-第二阶段+跟读', acceptance: '语速平稳，关键表达无误' }),
  Object.freeze({ dayInCycle: 5, title: '场景输出练习', instruction: '输出练习-AI对话', acceptance: '灵活运用3个以上核心表达' }),
  Object.freeze({ dayInCycle: 6, title: '真实工作应用', instruction: '输出练习-工作应用', acceptance: '结构完整，用词得体' }),
  Object.freeze({ dayInCycle: 7, title: '复习与实战', instruction: '复习+实战', acceptance: '主动创造1次使用机会' })
]);

export function getCycleForDay(day) {
  if (!Number.isInteger(day) || day < 1 || day > 70) {
    throw new RangeError('day must be an integer from 1 to 70');
  }
  return cycles[Math.floor((day - 1) / 7)];
}

export function getFocusForDay(day) {
  getCycleForDay(day);
  return dayFocus[(day - 1) % 7];
}
