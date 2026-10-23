/**
 * Today recipe (after the dashboard's Home): a date as the title, a week strip,
 * a written brief with tappable phrases instead of widgets, one hero tile that
 * glows (the exam), figures and what's next.
 */
import { motion } from 'motion/react';
import { BookOpen, CalendarClock, Dumbbell, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@ui/components/layout/AppShell';
import { Page, Section } from '@ui/components/layout/Page';
import { TabBar } from '@ui/components/layout/TabBar';
import { List, Row } from '@ui/components/core/List';
import { Stat } from '@ui/components/core/Stat';
import { Button } from '@ui/components/core/Button';
import { rise, SPRING } from '@ui/lib/motion';
import { cn } from '@ui/lib/cn';
import { Phone } from '../../kit/Phone';
import { Browser } from '../../kit/Browser';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Rules } from '../../kit/Doc';
import { TABS } from '../navigation/demoApp';

export default function TodayRecipe() {
  return (
    <Doc eyebrow="Recipes" title="Today" lead="The home screen as a letter, not a dashboard of widgets. One sentence tells you what matters; the phrases in it are links. Only the exam glows — it is the one thing that matters today.">
      <Demo padded={false} minHeight={760}>{() => <div className="w-full py-6"><Phone><TodayApp mode="phone" /></Phone></div>}</Demo>
      <Demo padded={false} minHeight={420}>{() => <div className="w-full p-4 @min-[760px]:p-8"><Browser><TodayApp mode="desktop" /></Browser></div>}</Demo>
      <DocSection title="Composition">
        <Rules items={[
          { do: 'Write the summary as prose with inline links (icon at .8em) — it reads in one breath.', dont: 'Nine equal widgets. When everything is a card, nothing is important.' },
          { do: 'Glow only the hero (ember radial on the exam tile).', dont: 'Invent numbers for empty days — say “Nothing planned”.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function TodayApp({ mode }: { mode: 'phone' | 'desktop' }) {
  const [tab, setTab] = useState(TABS[4].id);
  const [day, setDay] = useState(4);
  return (
    <AppShell mode={mode} className="!h-full" tabbar={<TabBar items={TABS} value={tab} onChange={setTab} />}>
      <Page title="Friday 24" place="home" heading={<h1 className="display text-[34px] @min-[900px]:text-[48px]">24 <span className="text-dim">Friday</span></h1>} eyebrow="October · week 43">
        <motion.div {...rise(0)} className="grid grid-cols-7 surface rounded-list p-[3px]">
          {DAYS.map((d, i) => (
            <button key={i} type="button" onClick={() => setDay(i)} className={cn('relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-[13px] text-tiny transition-colors duration-200', i === day ? 'text-bright' : 'text-dim')}>
              {i === day && <motion.span layoutId="today-day" className="absolute inset-0 rounded-[13px] bg-fill-4" transition={SPRING.snap} />}
              <span className="relative">{d}</span><span className="relative tabular text-body">{20 + i}</span>
              {[1, 4, 5].includes(i) && <i className={cn('absolute bottom-1 h-[3px] w-[3px] rounded-full', i === 5 ? 'bg-ember' : 'bg-white/40')} />}
            </button>
          ))}
        </motion.div>
        <motion.p {...rise(1)} className="mt-6 text-[20px] leading-[1.4] font-light tracking-[-.02em] text-ink @min-[900px]:text-[26px]">
          Your <Phrase Icon={BookOpen}>biology test</Phrase> is tomorrow at eight. You have <span className="text-bright">40 minutes</span> before <Phrase Icon={Dumbbell}>training</Phrase> — and <Phrase Icon={Mail}>two mails</Phrase> can wait.
        </motion.p>
        <motion.div {...rise(2)} className="relative mt-6 overflow-hidden surface rounded-card p-4">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgb(255_138_92/.1),transparent_70%)]" />
          <div className="relative flex items-end justify-between">
            <div><div className="flex items-center gap-1.5 text-meta text-ember"><i className="h-1.5 w-1.5 rounded-full bg-ember" />Exam</div><div className="mt-1.5 text-body text-bright">Biology — cells</div><div className="text-detail text-dim">Sat · 08:00 · Room 204</div></div>
            <div className="text-right"><div className="display tabular text-[40px]">17<span className="text-title text-dim">h</span></div><div className="text-meta text-dim">to go</div></div>
          </div>
          <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-fill-3"><motion.div className="h-full rounded-full bg-tab" initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} /></div>
          <div className="relative mt-2 flex justify-between text-meta text-dim"><span>Prepared</span><span className="tabular">72%</span></div>
        </motion.div>
        <motion.div {...rise(3)} className="mt-3 grid grid-cols-2 gap-3"><Stat value="6.4" unit="h" label="Focus this week" trend={12} /><Stat value="2:41" unit="h" label="Screen today" trend={-18} /></motion.div>
        <Section label="Next" action={<Button size="xs" variant="quiet" Icon={Sparkles}>Plan with Luna</Button>}>
          <List>
            <Row Icon={CalendarClock} title="Revise chapter 4" detail="Now · 40 min" onClick={() => {}} />
            <Row Icon={Dumbbell} title="Training" detail="17:30 · Gym" onClick={() => {}} />
            <Row Icon={MessageCircle} title="Mia — training at 6?" detail="Unanswered since 09:12" onClick={() => {}} />
          </List>
        </Section>
      </Page>
    </AppShell>
  );
}
function Phrase({ Icon, children }: { Icon: typeof BookOpen; children: React.ReactNode }) {
  return <button type="button" className="inline whitespace-nowrap text-bright underline decoration-white/20 decoration-[.5px] underline-offset-[5px] transition-colors hover:decoration-white/60"><Icon className="mr-1 inline !h-[.75em] !w-[.75em] -translate-y-[.05em] text-dim" />{children}</button>;
}
