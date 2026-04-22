import Link from "next/link";
import type { KellyAboutSlug } from "@/content/about/kelly-about-chapters";

const linkOut =
  "font-semibold text-red-dirt underline decoration-red-dirt/30 underline-offset-2 transition hover:decoration-red-dirt";
const lead = "font-body text-lg leading-relaxed text-deep-soil/88";
const p = "font-body text-base leading-relaxed text-deep-soil/82";

type Props = { slug: KellyAboutSlug };

/**
 * Long-form copy for each /about/[slug] chapter — the hub page shows only summaries; this is the full read.
 */
export function KellyChapterBody({ slug }: Props) {
  switch (slug) {
    case "story":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Voters do not follow abstractions—they follow <strong>people</strong> they feel they know. The Secretary of
            State’s office is about systems, filings, and law, but <strong>trust</strong> is still personal. You
            deserve to know who Kelly is: where she comes from, what she has already put on the line for this state, and
            why she is asking for your <strong>time and your voice</strong>—not just a box checked on a ballot.
          </p>
          <p className={p}>
            Earning confidence in a constitutional office is not a one-time ad buy. It is a series of
            <strong> visible decisions</strong> over years: how you treat small operators when the rules are confusing,
            how you answer reporters when the story is unflattering, and how you show up in counties that the political
            industry writes off. Kelly believes Arkansans are fair judges of character if you stop performing and start
            <strong> explaining</strong>—what you will do, what you will not do, and what the law already requires
            whether it is convenient or not.
          </p>
          <p className={p}>
            That is why this “Meet Kelly” section is built as a <strong>real biography</strong>, not a list of
            endorsements. Read the chapters in order or in whatever sequence fits your life—business first, or farm
            first, or civics first. The thread is the same: <em>public service in plain sight</em>, with enough detail
            that a neighbor on your porch can pressure-test the story in five minutes and walk away with an answer that
            feels <strong>honest</strong>, not rehearsed.
          </p>
          <p className={p}>
            If you are undecided, start where you are skeptical. If you are already with us, use these pages to{" "}
            <strong>equip someone else</strong>—because statewide races are not won by a campaign headquarters alone;
            they are won when thousands of one-on-one conversations finally line up with the work only a serious executive
            can run in a department that touches <strong>every</strong> voter, business, and local election official.
          </p>
        </div>
      );

    case "business":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Kelly’s strongest credential for running a <strong>constitutional office that serves businesses</strong> is
            not a slogan—it is <strong>decades inside large, complex operations</strong>. She spent{" "}
            <strong>almost 25 years</strong> with <strong>Alltel</strong> and then <strong>Verizon</strong> in
            leadership work that required her to <strong>manage large teams</strong>, read how work actually flows, and
            keep customer-impacting services stable when the stakes are high and the clock does not stop.
          </p>
          <p className={p}>
            Big telecom is not a perfect mirror for state government, but the <strong>habits</strong> overlap: you map
            the process, you remove duplicate steps, you train people so variance does not turn into public failure, and
            you protect the “customer” in front of you—even when the policy behind the counter is not yours to rewrite.
            The Secretary of State’s office sits at a similar intersection: <strong>clarity for filers</strong>,{" "}
            <strong>consistency for counties</strong>, and <strong>defensible administration of the law</strong> so
            employers spend less time unbreaking paperwork and more time building payroll.
          </p>
          <p className={p}>
            She also knows the other side of the counter. Kelly and her husband <strong>started a small market</strong>{" "}
            and <strong>built farm operations</strong>—permits, cash flow, weather, insurance, the mental load of
            payroll, and the quiet humiliation of a form you filled out three different ways because the instructions
            never quite matched the desk you were at. In a state where <strong>small business is the spine of local
            economies</strong>, the office should be an ally in <strong>reducing drag</strong>: predictable timelines,
            plain language, and process maps that do not require a lawyer to start a legitimate enterprise.
          </p>
          <p className={p}>
            Scale matters at the top and empathy matters at the bottom. When public-facing services improve,{" "}
            <strong>time and money are returned to operators first</strong>—and, over time, the savings compound across
            tens of thousands of transactions a year. That is not corporate welfare; it is <strong>competent
            government</strong> doing what a fair front office is supposed to do: save citizens from paying twice for
            the same simple mistake the system should have prevented.
          </p>
          <p className="rounded-xl border border-deep-soil/10 bg-deep-soil/[0.04] p-4 font-body text-sm text-deep-soil/75">
            <span className="font-bold text-deep-soil">Career background: </span>
            <a
              href="https://www.linkedin.com/in/kelly-grappe-48b6aa51/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkOut}
            >
              Kelly on LinkedIn
            </a>{" "}
            — roles, dates, and recommendations. Third-party campaign profiles may summarize the same public record
            slightly differently; use sources you trust to verify details that matter to you.
          </p>
        </div>
      );

    case "forevermost":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Kelly and her husband, Steve, built{" "}
            <a
              href="https://www.forevermostfarms.com"
              target="_blank"
              rel="noopener noreferrer"
              className={linkOut}
            >
              Forevermost Farms
            </a>{" "}
            between <strong>Romance and Joy</strong>—a farm they call home in the Rose Bud area.{" "}
            <strong>Stewardship</strong> there is not an aesthetic; it is a <strong>daily practice</strong> of showing up for soil, animals, and neighbors
            when the work is unglamorous and the margin is real.
          </p>
          <p className={p}>
            For years the operation was <strong>full-time</strong>: chickens, turkey, pork, and quail—offered
            earnestly, not as a side hobby, while they learned in public alongside customers who cared where food came
            from. When post-COVID costs made it impossible to run the business the same way, they made the call many
            small producers recognize: the operation <strong>paused from selling</strong> while the <strong>land and
            relationship to community</strong> did not. That is not failure in Kelly’s book—it is{" "}
            <strong>honesty with the numbers</strong>, the kind of straight talk Arkansans should expect in an office
            that issues bonds and files and public notices: tell the truth when the model breaks, and then adapt without
            pretending the old math still works.
          </p>
          <p className={p}>
            Farming also teaches a civic lesson that transfers straight into administration: you cannot <strong>buy
            trust off the shelf</strong> after you’ve skipped maintenance. The same is true of elections
            infrastructure and business registries. You fund what you want to keep strong; you do not get durable
            outcomes by raiding the parts of the system that do not make headlines. Kelly carries that <strong>long
            view</strong> into how she talks about the Secretary of State’s office: not as a stepping stone, but as a
            <strong> public asset</strong> to steward.
          </p>
          <p className={p}>
            The farm’s story—shared transparently, including the hard parts—is part of why Kelly believes{" "}
            <strong>integrity is a practice</strong>, not a mood. The people’s office should welcome scrutiny because it
            has nothing to fear from a citizen who read the form twice and still needs a human to answer the
            question—without being talked down to.
          </p>
          <p className="rounded-xl border border-deep-soil/10 bg-deep-soil/[0.04] p-4 font-body text-sm text-deep-soil/75">
            <span className="font-bold text-deep-soil">More: </span>
            <a href="https://www.forevermostfarms.com" target="_blank" rel="noopener noreferrer" className={linkOut}>
              forevermostfarms.com
            </a>{" "}
            (Rose Bud, AR)
          </p>
        </div>
      );

    case "stand-up-arkansas":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Democracy is not a spectator sport, and it is not only what happens in Washington.{" "}
            <a href="https://www.standuparkansas.com" target="_blank" rel="noopener noreferrer" className={linkOut}>
              Stand Up Arkansas
            </a>{" "}
            is a civics-oriented nonprofit Kelly helps lead: a <strong>grassroots hub</strong> for real conversations,{" "}
            <strong>leadership development</strong>, and tools that help ordinary Arkansans feel{" "}
            <strong>competent and equipped</strong> in their public life—precinct work, local boards, ballot measures,
            and the patient work of organizing that never fits in a 30-second ad.
          </p>
          <p className={p}>
            The through-line is <strong>recruit, train, activate</strong>: find people with fire in their chest, help
            them build skills that match the rules on the ground, then put them in roles where the state actually
            changes—in school districts, in county courthouses, in initiative campaigns, and in the long tail of
            <strong> follow-up</strong> that separates meaningful civic life from a one-off rally. That bias toward
            <strong> teaching</strong> instead of <strong> performing</strong> is exactly the posture Kelly wants from a
            Secretary of State: an office you can <strong>learn your way through</strong>, not a black box for insiders
            with the right contact.
          </p>
          <p className={p}>
            The values the organization publicizes are the same ones you want in someone who would swear an oath to
            uphold the law for everyone: <strong>inclusivity, empowerment, integrity, collaboration, continuous
            learning</strong>, and a durable commitment to <strong>democratic principles</strong>. The Secretary of
            State is not a legislator, but the office can model <strong>respect for the electorate</strong> in how it
            answers questions, how it enforces rules evenly, and how it equips both voters and local officials to do
            their jobs <strong>without tripping on ambiguity</strong>.
          </p>
          <p className={p}>
            If you care about <strong>ballot access and clarity</strong>, about <strong>youth and first-time
            voters</strong>, and about a culture where neighbors argue on purpose without treating each other as
            disposable, this work is not a cute sidebar in Kelly’s biography—it is the <strong>evidence of how she
            leads</strong> when no camera is guaranteed.
          </p>
          <p className="rounded-xl border border-field-green/25 bg-field-green/[0.06] p-4 font-body text-sm text-deep-soil/80">
            <span className="font-bold text-deep-soil">Explore: </span>
            <a
              href="https://www.standuparkansas.com/civic-education-hub"
              target="_blank"
              rel="noopener noreferrer"
              className={linkOut}
            >
              Civic education hub
            </a>{" "}
            ·{" "}
            <a href="https://www.standuparkansas.com/about-us" target="_blank" rel="noopener noreferrer" className={linkOut}>
              About us
            </a>{" "}
            ·{" "}
            <a href="https://www.standuparkansas.com" target="_blank" rel="noopener noreferrer" className={linkOut}>
              standuparkansas.com
            </a>
          </p>
        </div>
      );

    case "initiatives-petitions":
      return (
        <div className="space-y-6">
          <p className={lead}>
            In <strong>2023</strong>, after the <strong>LEARNS Act</strong> was passed, Kelly worked alongside her
            husband, <strong>Steve</strong>, as he launched the <strong>referendum petition</strong> to place LEARNS on
            the ballot. The effort had <strong>two goals</strong>: first, to let Arkansans vote on whether that law should
            stand—because how the state spends <strong>education dollars</strong> is a financial decision big enough that
            Kelly believed it belonged with <strong>the people at the ballot box</strong>, whether you were for the act
            or against it. Second, to use the ballot-initiative process to <strong>help organize the state</strong>—from
            the neighborhood up.
          </p>
          <p className={p}>
            The year that followed, Kelly helped <strong>lead coordination</strong> to bring resources to{" "}
            <strong>petitioners across Arkansas</strong> and to support volunteers statewide. They{" "}
            <strong>rented a small duplex in Sherwood</strong> to serve as a <strong>central hub</strong>: a place to pick
            up petitions, drop them off, connect with <strong>notaries</strong>, and keep the work organized so
            volunteers were not left to figure out the mechanics alone.
          </p>
          <p className={p}>
            In the current cycle, the work has expanded to <strong>multiple statewide initiatives</strong> and to{" "}
            <strong>local campaigns</strong>—for example, efforts in <strong>Jacksonville</strong> aimed at changing{" "}
            <strong>at-large voting</strong> patterns with roots in <strong>Jim Crow–era</strong> structures. Through it
            all, the philosophy is consistent: <strong>help communities organize themselves locally</strong>, build a
            better place where you live first, then work together across <strong>counties</strong>, the{" "}
            <strong>state</strong>, and—when it makes sense—the country. The last several years have put that{" "}
            <strong>local-first</strong> muscle front and center.
          </p>
          <p className={p}>
            Kelly is <strong>not personally circulating petitions</strong> this year so there is no fair question of
            bias in how she would administer the office—but she <strong>believes in the process</strong>: if the people
            of Arkansas want the question on the ballot, <strong>they should get to vote</strong>. She also believes we
            should <strong>work to limit corporate and dark money</strong> in initiative politics—ideally keeping
            citizen-led work <strong>volunteer-centered</strong> so that money and paid interests do not, once again,{" "}
            <strong>outweigh people’s power and rights</strong> in a process meant to belong to the public.
          </p>
        </div>
      );

    case "why-secretary-of-state":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Kelly is running for Secretary of State because the work that has formed her is the work this office
            demands: <strong>discipline</strong> when the rules and the resources do not line up,{" "}
            <strong>patience</strong> with people who are new to a process, and <strong>fierce protectiveness</strong> of
            public trust when cynicism is the cheap exit.
          </p>
          <ul className="list-none space-y-3 font-body text-base leading-relaxed text-deep-soil/85">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Telecom operations</strong> taught her to <strong>run real
                teams</strong>, to see <strong>process</strong> as something you improve on purpose, and to design
                service so the next person in line is not paying for the last person’s shortcut.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Farming and a small market</strong> taught her that{" "}
                <strong>neglect and favoritism</strong> both have consequences you cannot market away—small operators
                feel <strong>every</strong> friction in fees, time, and paperwork, and the office should be built to
                reduce that drag without lowering standards.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Civic work</strong> taught her that <strong>democracy is a
                skill</strong>—and that Arkansans will step up when someone meets them with <strong>training and
                respect</strong>, not a lecture from on high.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">Ballot initiative campaigns</strong> taught her that{" "}
                <strong>direct democracy is logistics</strong>—petitions, notaries, volunteers, and a process that should
                stay <strong>centered on citizens</strong>, not dark money and outside interests.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              <span>
                <strong className="text-deep-soil">The Secretary of State role</strong> is where the threads meet:
                the <strong>systems</strong> that make <strong>elections</strong>, <strong>records</strong>, and{" "}
                <strong>commerce</strong> legible in real life—<strong>all 75 counties</strong>, year after year.
              </span>
            </li>
          </ul>
          <p className={p}>
            The job is not to win a cable debate. The job is to <strong>administer with steadiness</strong>—so that a
            county clerk in a small office gets answers when something breaks on a Friday, a first-time filer in a
            garage enterprise gets clarity without being made to feel small, and a voter can trust that the
            <strong> rules were followed</strong> even when the outcome is not what they wanted. That is the standard
            Kelly is offering: <strong>lawful, equal, and transparent</strong>—and yes, that includes welcoming tough
            questions from opponents because confidence without scrutiny is not confidence at all; it is theater.
          </p>
          <p className={p}>
            She is a Democrat who <strong>does not expect a free pass on scrutiny</strong>—and who believes you earn
            statewide office by <strong>showing up for the whole state</strong>, including voters, clerks, and business
            owners who will never agree on everything else. “People over politics” only matters if it shows up in{" "}
            <strong>how the office is run on a Tuesday in August</strong>, not just in a line on a mailer.
          </p>
        </div>
      );

    case "your-part":
      return (
        <div className="space-y-6">
          <p className={lead}>
            Movements do not run on hope alone. They run on <strong>relationships</strong>—and on your willingness to do
            one hard thing: <strong>bring someone with you</strong> into a conversation they would rather skip. Kelly is
            asking for your <strong>time</strong> and your <strong>voice</strong> in that order, because a statewide
            campaign that does not <strong>scale through trust</strong> is only noise.
          </p>
          <ol className="list-decimal space-y-4 pl-5 font-body text-base leading-relaxed text-deep-soil/85">
            <li>
              <strong>Know the story</strong> well enough to explain it in one minute to a neighbor who does not follow
              politics: <strong>business and farm</strong> experience, <strong>Stand Up</strong>, ballot and initiative
              work, and what the Secretary of State’s office is actually responsible for under law (not a fantasy portfolio).
            </li>
            <li>
              <strong>Claim your county</strong>—rural, suburban, or urban. Help the campaign <strong>show up where
              Arkansas really lives</strong>, not just where the cameras already are. Momentum in this state is
              <strong> relational</strong>: neighbor to neighbor, club to club, church basement to VFW.
            </li>
            <li>
              <strong>Stack hands</strong>: host, door-knock, make calls, bring food to a training, or run errands for
              someone who is already doing the work. Momentum is <strong>reciprocal</strong>—when you act, you give
              others permission to act.
            </li>
          </ol>
          <p className={p}>
            If you are the kind of person who <strong>does your homework</strong> before you endorse, good—Kelly wants
            voters who ask hard questions. If you are already in, the next job is to <strong>equip a skeptic</strong>{" "}
            with a link to these chapters and a coffee-table conversation: not to win a debate, but to <strong>replace
            rumor with first-hand copy</strong> people can read for themselves.
          </p>
          <p className="font-body text-base text-deep-soil/78">
            Need a person, not a page:{" "}
            <a href="mailto:kelly@kellygrappe.com" className={linkOut}>
              kelly@kellygrappe.com
            </a>
            . Or start at{" "}
            <Link href="/get-involved" className={linkOut}>
              Get involved
            </Link>{" "}
            and <Link href="/events" className={linkOut}>Events</Link> to find something close to home this week.
          </p>
        </div>
      );

    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}
