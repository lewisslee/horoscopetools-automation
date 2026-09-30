from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]

DATA = {
"aries": {
"name":"Aries","question":"Does an Aries stellium make you reckless or aggressive?",
"verdict":"An Aries stellium concentrates several drives in the sign of initiation. It can make action the first language of the chart, but it does not make aggression inevitable. The real issue is pacing: each planet wants to begin in its own way, and unmanaged urgency can turn speed into collision.",
"quote":"Aries lol","source":"r/astrologymemes, “Which sign stelliums are the most terrifying?”, April 15, 2026","url":"https://www.reddit.com/r/astrologymemes/comments/1sm4333/which_sign_stelliums_are_the_most_terrifying/",
"answer":"The stereotype confuses force with harm. Aries supplies immediacy, appetite, and willingness to test reality. Mars shows how that force is directed; the houses show where it lands; Saturn contacts can brake it, while Jupiter contacts can enlarge it. A fast response can be brave, clumsy, protective, competitive, or inventive.",
"planets":"With Mercury involved, speech may arrive before editing. Venus may pursue rather than wait. Mars adds heat and clean confrontation; Saturn turns the same fire into disciplined endurance. Identify which planet starts the chain and which one has to deal with the consequences.",
"test":"Track the ten seconds before action for one week. Write down the trigger, the first impulse, and the result. The useful Aries skill is not hesitation for its own sake; it is choosing which impulse deserves immediate motion.",
"myth":"An Aries stellium is not proof that someone is dangerous. It describes concentrated initiative, whose ethics and expression depend on the whole chart and lived choices."},
"taurus": {
"name":"Taurus","question":"Why can a Taurus stellium struggle to get started?",
"verdict":"A Taurus stellium is built for sustained investment, not instant switching. What looks like laziness is often inertia: several planetary needs are waiting for enough safety, value, or sensory certainty before they move. Once engaged, the same concentration can outlast faster starters.",
"quote":"Sometimes I find myself being lazy or having a hard time starting a task.","source":"r/Taurusgang, “Advice for Taurus stellium?”, August 25, 2025","url":"https://www.reddit.com/r/Taurusgang/comments/1mznvy4/advice_for_taurus_stellium/",
"answer":"Taurus is fixed earth, so changing state costs energy. The cluster may protect what already works until the cost of staying still becomes tangible. That is different from lacking ambition. The house shows the area where transitions are slow; the planets show what needs reassurance before movement begins.",
"planets":"Mercury seeks a practical reason, Venus a worthwhile return, Mars a steady physical rhythm, and Saturn a durable plan. If the Moon joins them, comfort and familiarity can become the gatekeeper. Do not flatten those motives into one label such as stubborn.",
"test":"Reduce the first step until it requires no identity change: open the document, place the shoes by the door, move one object. Taurus momentum grows through continuity. Judge the pattern by completion and durability, not by how dramatic the start looks.",
"myth":"A Taurus stellium does not guarantee wealth, beauty, or laziness. It concentrates questions of value, stability, embodiment, and resistance to unnecessary change."},
"gemini": {
"name":"Gemini","question":"Does a Gemini stellium make you scattered or shallow?",
"verdict":"A Gemini stellium multiplies channels of attention. It can feel scattered because several planetary functions are gathering, comparing, and transmitting information at once. That is not the same as lacking depth; depth may arrive through connections across topics rather than a single uninterrupted tunnel.",
"quote":"I get fatigued by noticing and processing every single thing — all day long — even in my dreams.","source":"r/AstrologyCharts, “Please shed some light on what my Gemini stellium means for my life”, September 8, 2026","url":"https://www.reddit.com/r/AstrologyCharts/comments/1n1s5ue/please_shed_some_light_on_what_my_gemini_stellium/",
"answer":"The pressure point is selection. Gemini keeps alternatives alive, which helps learning and translation but can exhaust working memory. Mercury’s sign, house, speed, and aspects matter more than the cliché. A strong Saturn link may organize the stream; Neptune can blur it; Mars can make it rapid and argumentative.",
"planets":"Sun in the cluster identifies through inquiry. Moon regulates through naming and exchange. Venus enjoys variety and dialogue. Mars debates or pursues multiple leads. The planet list tells you whether the overload is primarily mental, relational, emotional, or behavioral.",
"test":"Use a capture-and-close rule: record every new thread, choose one to finish for twenty minutes, then deliberately reopen the list. The goal is not to suppress curiosity; it is to give curiosity a reliable container.",
"myth":"A Gemini stellium does not prove dishonesty, inconsistency, or superficiality. It describes concentrated adaptability and information exchange."},
"cancer": {
"name":"Cancer","question":"Does a Cancer stellium mean emotions run the whole chart?",
"verdict":"A Cancer stellium makes protection, memory, belonging, and emotional timing central to several planets at once. It does not mean constant crying or poor control. Some people show the concentration through guardedness, caretaking, private processing, or a strong radar for changes in safety.",
"quote":"I am very moody and emotional. It has been overwhelming at times.","source":"r/astrologymemes, “Most difficult stellium to have”, November 22, 2023","url":"https://www.reddit.com/r/astrologymemes/comments/1817jr1/most_difficult_stellium_to_have/",
"answer":"Cancer is cardinal water: feeling can initiate action. The question is whether the cluster distinguishes present signals from remembered ones. The Moon’s placement is the control room. Its condition shows how quickly the person retreats, nurtures, defends, or reopens after a threat.",
"planets":"Mercury remembers tone and context; Venus bonds through care; Mars protects and may act indirectly when exposed; Saturn can harden the shell. A Cancer stellium with a well-supported Moon may be emotionally decisive rather than visibly soft.",
"test":"When a reaction rises, label three things separately: what happened now, what it reminds you of, and what protection is actually needed. This keeps memory useful without letting it impersonate current evidence.",
"myth":"A Cancer stellium is not a diagnosis of fragility. Sensitivity can support accurate timing, loyalty, boundary detection, and leadership under emotional pressure."},
"leo": {
"name":"Leo","question":"Does a Leo stellium need constant attention?",
"verdict":"A Leo stellium concentrates the need to create from a recognizable center. Being seen matters, but attention is usually a signal, not the final goal: the deeper need is to know that one’s contribution has landed. When that signal is missing, performance can become louder or disappear entirely.",
"quote":"I liked performing but the attention I didn’t like.","source":"r/astrologymemes, “Question for Leo’s or those with Leo placements”, December 28, 2023","url":"https://www.reddit.com/r/astrologymemes/comments/18sh1nq/question_for_leos_or_those_with_leo_placements/",
"answer":"Leo is fixed fire. It sustains a personal creative flame and wants authorship acknowledged. The stereotype mistakes visibility for vanity. Some Leo-heavy people avoid exposure because judgment feels unusually personal; others learn to separate the work’s reception from their worth.",
"planets":"Mercury wants a distinct voice, Venus wants warm appreciation, Mars defends pride, and Saturn can make self-expression cautious or exacting. The Sun’s placement and aspects show whether recognition feels available, risky, or earned only through performance.",
"test":"Make something for a named audience of one and define success before sharing it. If the work still feels alive without broad applause, expression is leading. If it collapses, investigate the unmet need for recognition rather than shaming it.",
"myth":"A Leo stellium does not equal narcissism. It concentrates authorship, vitality, play, loyalty, and the task of giving from a stable sense of self."},
"virgo": {
"name":"Virgo","question":"Must a Virgo stellium look organized and perfectionistic?",
"verdict":"A Virgo stellium concentrates discernment, revision, and practical response, but it may produce messy experiments as easily as immaculate systems. The common denominator is noticing what could work better. Organization is only one possible tool for answering that pressure.",
"quote":"It seems I have a Virgo Stellium. Doesn't surprise me... but all of it fits except I am NOT organized.","source":"r/virgoseason, “Virgo Stellium”, September 8, 2025","url":"https://www.reddit.com/r/virgoseason/comments/1nbm8te/virgo_stellium/",
"answer":"Virgo is mutable earth: it adjusts methods to improve results. A person can be highly analytical yet externally disordered, especially when attention is spent fixing other systems. Mercury’s condition shows how observations are sorted; the house shows where standards and repair work accumulate.",
"planets":"Sun identifies with usefulness, Moon seeks calm through workable routines, Venus refines taste and care, and Mars attacks errors. Saturn may formalize the method; Neptune may make the standards elusive. The planets explain what is being improved and at what emotional cost.",
"test":"Before revising, name the acceptance condition in one sentence. Stop when it is met. This turns discernment into service and prevents an internal quality check from becoming an endless veto.",
"myth":"A Virgo stellium does not require tidiness, anxiety, or criticism. It concentrates the urge to distinguish, adapt, and make something function better."},
"libra": {
"name":"Libra","question":"Does a Libra stellium trap you in people pleasing?",
"verdict":"A Libra stellium makes relationship, proportion, and competing viewpoints central to several planets. People pleasing is one possible failure mode, not the placement’s purpose. The mature task is to include your own position in the balance instead of treating everyone else as the only evidence.",
"quote":"I have grown immensely out of people pleasing and showing up as myself but I feel like it’s still not enough.","source":"r/libra_astrology, “Advice for a Libra stellium”, March 28, 2026","url":"https://www.reddit.com/r/libra_astrology/comments/1s6e0rv/advice_for_a_libra_stellium/",
"answer":"Libra is cardinal air. It initiates comparison, negotiation, and social design. Indecision appears when every option keeps its advocate but no criterion gets authority. Venus’s placement reveals what feels worth preserving; Mars shows how disagreement is handled.",
"planets":"Mercury argues both sides, Moon monitors relational weather, Venus seeks reciprocity, and Mars may alternate between diplomacy and sharp correction. Saturn can make fairness procedural. A crowded Libra is not passive by definition; it can be relentless about principle.",
"test":"For one decision, write your preference before asking anyone else. Then seek input. If new evidence changes the answer, change it; if only discomfort changes it, keep the original choice visible.",
"myth":"A Libra stellium does not mean someone is fake or incapable of choosing. It concentrates the work of making fair choices without erasing the chooser."},
"scorpio": {
"name":"Scorpio","question":"Does a Scorpio stellium make you secretive and controlling?",
"verdict":"A Scorpio stellium concentrates several planetary needs around trust, leverage, exposure, and irreversible change. Privacy can look secretive, and vigilance can look controlling, but neither is automatic. The decisive question is whether protection serves consent and truth or tries to eliminate uncertainty.",
"quote":"I’ve just accepted that I’m an intense person and nothing will ever be gray.","source":"r/astrology, “Any stories surrounding a difficult aspect of your chart you have managed to make peace with?”, March 29, 2021","url":"https://www.reddit.com/r/astrology/comments/mfw0d0/any_stories_surrounding_a_difficult_aspect_of/",
"answer":"Scorpio is fixed water. It holds emotional charge long enough to investigate what others may avoid. That supports loyalty and recovery, but can also keep an old threat active. Mars describes pursuit and defense; Pluto adds a generational layer and matters most when tightly connected to personal planets.",
"planets":"Mercury probes subtext, Venus tests reciprocity, Mars acts strategically, and Saturn formalizes trust. Moon involvement makes safety visceral. The house locates the arena; the aspects show whether the planets cooperate or force repeated renegotiation.",
"test":"Before withholding or testing someone, state the feared outcome and the evidence for it. Then choose a direct boundary that does not require mind reading. Privacy is healthy when its terms are explicit.",
"myth":"A Scorpio stellium does not prove manipulation, trauma, or psychic power. It concentrates depth, risk assessment, attachment, and transformation."},
"sagittarius": {
"name":"Sagittarius","question":"Can a Sagittarius stellium want real commitment?",
"verdict":"A Sagittarius stellium does not reject commitment; it rejects commitments that make growth, candor, or movement impossible. Several planets are trying to enlarge their field at once. The durable bond is one that has a direction and enough room for both people to keep discovering.",
"quote":"I’m a Sag… who loves commitment. Why can’t I find anyone who wants to commit back?","source":"r/AstrologyCharts, “I’m a Sag…who loves commitment”, August 11, 2025","url":"https://www.reddit.com/r/AstrologyCharts/comments/1mna6rh/",
"answer":"Sagittarius is mutable fire. It updates its direction through experience and meaning, which can resemble restlessness from outside. Jupiter’s placement shows what kind of expansion feels honest. A person may commit fiercely to a shared quest while resisting a bond built only on repetition.",
"planets":"Mercury seeks a larger framework, Venus needs shared values and fresh perspective, Mars pursues horizons, and Saturn asks the ideals to become practice. Neptune can idealize the journey; Jupiter can overpromise. The specific mix matters more than the freedom stereotype.",
"test":"Define commitment as a set of chosen promises, then add the growth each promise must protect. If freedom only means avoiding accountability, the test exposes it. If the bond supports learning and truth, Sagittarius can stay for the long road.",
"myth":"A Sagittarius stellium does not guarantee infidelity, travel, optimism, or fear of commitment. It concentrates the search for meaning and room to develop."},
"capricorn": {
"name":"Capricorn","question":"Does a Capricorn stellium turn life into work?",
"verdict":"A Capricorn stellium concentrates accountability, consequence, and long-range construction. Work can become the visible outlet, but the deeper pattern is carrying weight and measuring what will last. The risk is confusing usefulness with worth and accepting responsibility that was never fairly assigned.",
"quote":"I have workaholic tendencies but its uneven lol like not with everything and not always.","source":"r/capricorns, “Anybody with Capricorn Stellium”, March 12, 2025","url":"https://www.reddit.com/r/capricorns/comments/1j959ov/",
"answer":"Capricorn is cardinal earth. It starts structures, sets priorities, and anticipates the bill. Saturn’s sign, house, and aspects show where pressure comes from and how it matures. A heavy Capricorn signature can be playful off duty; restraint is often selective rather than total.",
"planets":"Sun identifies with competence, Moon may ration vulnerability, Mercury plans by constraints, Venus values reliability, and Mars climbs through friction. If Neptune joins, ambition may serve an ideal; Uranus may rebuild the institution instead of simply obeying it.",
"test":"List every responsibility you carry and mark who assigned it, who benefits, and what happens if you stop. Keep the duties that express chosen integrity. Renegotiate the ones maintained only by guilt or reputation.",
"myth":"A Capricorn stellium does not make someone cold, rich, or automatically successful. It concentrates the relationship with time, standards, authority, and earned results."},
"aquarius": {
"name":"Aquarius","question":"Why can an Aquarius stellium feel social and alienated at once?",
"verdict":"An Aquarius stellium can connect easily through ideas while protecting a large private distance. Several planets are oriented toward systems, groups, or future possibilities, yet personal belonging may still feel conditional. Social skill and emotional recharge are separate variables.",
"quote":"I often feel different from others, but am also a social butterfly and can easily connect with most people.","source":"r/aquarius, “Aquarius Stellium”, October 22, 2025","url":"https://www.reddit.com/r/aquarius/comments/1od11uy/aquarius_stellium/",
"answer":"Aquarius is fixed air. It holds a principle or model steady enough to challenge convention. Saturn shows the rules and distance; Uranus describes disruption and is especially personal when it aspects the cluster closely. Neither ruler means emotion is absent.",
"planets":"Mercury thinks in networks, Venus bonds through friendship and shared ideals, Mars fights for autonomy, and Moon may process feelings by observing them first. A person can care about humanity and still need recovery after ordinary social contact.",
"test":"Separate three needs on your calendar: group contribution, one-to-one intimacy, and solitude. Do not use success in one as proof that the others should require no maintenance.",
"myth":"An Aquarius stellium does not make someone emotionless, rebellious, or technologically gifted. It concentrates independence, pattern recognition, and participation in systems larger than the self."},
"pisces": {
"name":"Pisces","question":"Does a Pisces stellium mean you absorb everyone’s emotions?",
"verdict":"A Pisces stellium can make boundaries between signals unusually permeable, but it does not sentence someone to emotional overload. Several planets are responding through imagination, empathy, and context. The practical task is learning which impressions belong to you, which belong to others, and which are only possibilities.",
"quote":"I also absorb peoples energy and it sucks.","source":"r/astrologymemes, “Fuck being a Pisces stellium”, July 29, 2024","url":"https://www.reddit.com/r/astrologymemes/comments/1eed4eo/fuck_being_a_pisces_stellium/",
"answer":"Pisces is mutable water. It adapts by sensing the whole field, which can support art, compassion, and symbolic thinking. Neptune’s condition shows where ideals or ambiguity enter; Jupiter shows the search for faith and coherence. Overload is a boundary problem, not proof of supernatural absorption.",
"planets":"Mercury thinks associatively, Venus merges through tenderness, Mars may act indirectly until a cause feels meaningful, and Saturn gives form to the porous field. Moon involvement intensifies bodily and emotional resonance. Check the houses and aspects before generalizing.",
"test":"When a feeling arrives, note the time, place, bodily cue, and observable trigger. Wait before assigning ownership. Consistent records help distinguish empathy, projection, sensory overload, and your own unmet need.",
"myth":"A Pisces stellium does not guarantee psychic ability, victimhood, addiction, or artistic talent. It concentrates receptivity, imagination, surrender, and the need for workable edges."}
}

CSS = ''':root{--bg:#080611;--panel:#120e21;--text:#f6f2ff;--muted:#d4ccf0;--muted2:#aaa0d4;--gold:#f0d088;--line:rgba(240,208,136,.24);--violet:#9f7aea;--shadow:0 18px 50px rgba(0,0,0,.34)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 78% 0,rgba(112,73,169,.2),transparent 34rem),var(--bg);color:var(--text);font:16px/1.68 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}a{color:var(--gold)}.wrap{width:min(960px,calc(100% - 40px));margin:auto}.nav{height:70px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.brand{font:700 1.08rem Georgia,serif;color:var(--text);text-decoration:none;letter-spacing:.08em}.navlinks{display:flex;gap:22px}.navlinks a{color:var(--muted);text-decoration:none;font-size:.92rem}.navlinks a:hover{color:var(--gold)}.hero{padding:54px 0 28px}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:.76rem;font-weight:700}.hero h1{font:600 clamp(2.2rem,6vw,4.4rem)/1.04 Georgia,serif;margin:12px 0 18px}.verdict{background:linear-gradient(145deg,rgba(240,208,136,.12),rgba(159,122,234,.08));border:1px solid rgba(240,208,136,.45);border-radius:20px;padding:24px;box-shadow:var(--shadow)}.verdict b{display:block;color:var(--gold);letter-spacing:.16em;font-size:.76rem;margin-bottom:8px}.verdict p{margin:0;color:var(--text);font:600 clamp(1.08rem,2vw,1.27rem)/1.55 Georgia,serif}.meta{color:var(--muted2);font-size:.88rem;margin-top:16px}main{max-width:760px;padding:18px 0 82px}h2{font:600 1.85rem/1.2 Georgia,serif;margin:42px 0 12px}p{color:var(--muted)}blockquote{margin:18px 0;padding:17px 20px;border-left:3px solid var(--violet);background:rgba(159,122,234,.08);color:var(--text)}blockquote cite{display:block;color:var(--muted2);font-size:.82rem;margin-top:8px}.rule{border-left:3px solid var(--gold);padding:16px 20px;background:rgba(240,208,136,.07);border-radius:0 12px 12px 0;color:var(--muted)}.rule strong{color:var(--text)}.cta{display:inline-block;margin-top:14px;background:var(--gold);color:#1b1423;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:999px}.cta:hover{transform:translateY(-2px);box-shadow:0 0 0 1px rgba(240,208,136,.35),0 12px 30px rgba(240,208,136,.2)}footer{border-top:1px solid rgba(255,255,255,.08);padding:30px 0;color:var(--muted2);font-size:.88rem}.footerlinks{display:flex;gap:18px;flex-wrap:wrap}.footerlinks a{color:var(--muted)}@media(max-width:780px){.navlinks{display:none}.hero{padding-top:40px}.wrap{width:min(100% - 28px,960px)}}@media(max-width:480px){.hero h1{font-size:clamp(2rem,10vw,3.2rem)}body{font-size:15.5px}.verdict{padding:19px}}'''

def render(slug, d):
    title = d['question']
    desc = f"A direct answer to {d['question'].lower()} Read the planets, ruler, and real-life pattern without reducing the chart to a cliché."
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(desc)}"><link rel="canonical" href="https://horoscopetools.com/stellium/{slug}/">
<meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(desc)}"><meta property="og:url" content="https://horoscopetools.com/stellium/{slug}/"><meta property="og:type" content="article">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-NM5CK35NXE"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-NM5CK35NXE');</script><style>{CSS}</style></head>
<body><header class="wrap nav"><a class="brand" href="/">HOROSCOPE TOOLS</a><nav class="navlinks"><a href="/">Home</a><a href="/zodiac-signs/">Zodiac Signs</a><a href="/natal-chart.html">Natal Chart</a><a href="/compatibility/">Compatibility</a></nav></header>
<section class="wrap hero"><div class="eyebrow">Stellium Guide · {d['name']}</div><h1>{escape(title)}</h1><div class="verdict"><b>VERDICT</b><p>{d['verdict']}</p></div><p class="meta">Published September 29, 2026 · Educational astrology guide</p></section>
<main class="wrap"><h2>{d['question']}</h2><p>{d['answer']}</p>
<h2>A real question behind the stereotype</h2><blockquote>“{d['quote']}”<cite><a href="{d['url']}" rel="nofollow noopener">{d['source']}</a></cite></blockquote>
<h2>Read the planets, not just the sign</h2><p>{d['planets']}</p>
<h2>A useful test</h2><p>{d['test']}</p><a class="cta" href="/natal-chart.html">Check my birth chart</a>
<h2>One claim to reject</h2><p>{d['myth']}</p>
</main><footer><div class="wrap"><div class="footerlinks"><a href="/">Home</a><a href="/zodiac-signs/">Zodiac Signs</a><a href="/natal-chart.html">Natal Chart</a><a href="/compatibility/">Compatibility</a></div><p>© 2026 HoroscopeTools. Astrology is for reflection and entertainment.</p></div></footer></body></html>'''

for slug, data in DATA.items():
    target = ROOT / "site" / "stellium" / slug / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render(slug, data), encoding="utf-8")
print(f"built {len(DATA)} stellium sign pages")

