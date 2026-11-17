// Edit of the 15 s promo (16:9), cut to the reference reel's track (97.5 BPM). Beat times were
// measured from that audio: KICKS are the eight intro beats, HITS the percussion after the drop
// at 4.865 s. Every cut lands on one; hits that are not cuts punch the exposure.

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION = 15;
export const DROP = 4.865;
export const END = 14.106;

export const KICKS = [0, 0.557, 1.173, 1.788, 2.403, 3.03, 3.646, 4.261];
export const HITS = [
  4.865, 5.341, 5.793, 6.107, 6.409, 6.722, 7.036, 7.338, 7.802, 8.255, 8.568, 8.87, 9.172, 9.497, 9.799, 10.263,
  10.716, 11.041, 11.343, 11.656, 11.958, 12.272, 12.725, 13.177, 13.502, 13.804, 14.106, 14.431, 14.733,
];

// Intro titles, in this order: the name alone, then the role alone, then both locked up.
export const TITLES = [
  { from: 0, kind: 'rule' },
  { from: 0.557, kind: 'name' },
  { from: 2.403, kind: 'role' },
  { from: 4.261, kind: 'lockup' },
];
export const NAME = 'JAHAZIEL';
export const FULL_NAME = 'JAHAZIEL HERNÁNDEZ';
export const ROLE = 'AI ENGINEER';
export const URL = 'jahaziel-portfolio-motion.vercel.app';

const strobe = (from, src) => ({ from, to: from + 4 / FPS, ...src, dim: 0.5, enter: 'cut' });
const black = (from, to) => ({ from, to, black: true });

// Sources: { clip, start, speed } is captured site footage; { still, focus } a captured page with
// a slow push towards focus (0-1 of the frame); { code: true } the agent source as an editor.
export const SEGMENTS = [
  black(0, 1.173),
  strobe(1.173, { clip: 'corridor', start: 3.2, speed: 0 }),
  black(1.306, 1.788),
  strobe(1.788, { code: true }),
  black(1.921, 3.03),
  strobe(3.03, { still: 'github', focus: [0.3, 0.3] }),
  black(3.163, 3.646),
  strobe(3.646, { clip: 'hero', start: 6.6, speed: 0 }),
  black(3.779, DROP),

  { from: DROP, to: 5.793, clip: 'hero', start: 5.4, speed: 0.6, enter: 'flash', caption: { es: 'PORTAFOLIO 2026', en: 'PORTFOLIO 2026' } },
  { from: 5.793, to: 7.036, clip: 'work', start: 0.5, speed: 2.2, enter: 'cut', metric: { value: '4×', label: { es: 'MÁS CAPACIDAD POR INSTANCIA', en: 'MORE CAPACITY PER INSTANCE' } } },
  { from: 7.036, to: 7.338, code: true, enter: 'whip', caption: { es: 'LANGGRAPH + FASTAPI', en: 'LANGGRAPH + FASTAPI' } },
  { from: 7.338, to: 8.568, clip: 'corridor', start: 0.6, speed: 2.1, enter: 'flash', caption: { es: 'TRAYECTORIA', en: 'EXPERIENCE' } },
  { from: 8.568, to: 9.172, still: 'github', focus: [0.3, 0.3], enter: 'whip', metric: { value: '1,036', label: { es: 'CONTRIBUCIONES EN UN AÑO', en: 'CONTRIBUTIONS IN ONE YEAR' } } },
  { from: 9.172, to: 10.263, clip: 'case', start: 0.4, speed: 1.6, enter: 'cut', metric: { value: '71×', label: { es: 'LECTURAS MÁS RÁPIDAS', en: 'FASTER READS' } } },
  { from: 10.263, to: 10.716, still: 'openwahi', focus: [0.5, 0.38], enter: 'whip', caption: { es: 'OPEN SOURCE', en: 'OPEN SOURCE' } },
  { from: 10.716, to: 11.958, clip: 'wahi', start: 0.2, speed: 1.4, enter: 'flash', caption: { es: 'WAHI, MI PRODUCTO', en: 'WAHI, MY PRODUCT' } },
  { from: 11.958, to: 12.725, clip: 'tabs', start: 0.15, speed: 2, enter: 'cut', caption: { es: 'TOP 3 POR EMPRESA', en: 'TOP 3 PER COMPANY' } },
  { from: 12.725, to: 13.502, clip: 'cv', start: 0, speed: 2, enter: 'whip', caption: { es: 'CV EN PDF', en: 'RÉSUMÉ PDF' } },
  { from: 13.502, to: END, clip: 'corridor', start: 5.3, speed: 1.4, enter: 'cut' },
  { from: END, to: DURATION, black: true, enter: 'flash', kind: 'end' },
];

// Excerpt (comments trimmed) of the agent's graph wiring from openwahi,
// backend/app/modules/ai_assistant/langgraph_agent.py. Shown without line numbers on purpose.
export const CODE = {
  file: 'openwahi / langgraph_agent.py',
  lines: [
    '    def should_continue(state: AgentState):',
    '        """Decide si continuar llamando herramientas o terminar."""',
    '        last_message = state["messages"][-1]',
    '',
    '        if hasattr(last_message, "tool_calls") and last_message.tool_calls:',
    '            return "tools"',
    '',
    '        return END',
    '',
    '    workflow = StateGraph(AgentState)',
    '    workflow.add_node("agent", agent_node)',
    '',
    '    if tools:',
    '        tool_node = ToolNode(tools)',
    '        workflow.add_node("tools", tool_node)',
    '',
    '    workflow.set_entry_point("agent")',
    '',
    '    if tools:',
    '        workflow.add_conditional_edges(',
    '            "agent", should_continue, {"tools": "tools", END: END}',
    '        )',
    '        workflow.add_edge("tools", "agent")',
    '',
    '    agent = workflow.compile()',
    '    return agent',
  ],
};
