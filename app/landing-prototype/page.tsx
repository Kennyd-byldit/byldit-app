import './landing-prototype.css'

const projectTypes = [
  'Maintenance',
  'Diagnostics',
  'Repairs',
  'Upgrades',
  'Restorations',
]

const problemCards = [
  {
    title: 'Research gets scattered',
    body: 'Parts links, forum advice, screenshots, notes, and half-finished plans end up everywhere except where the project lives.',
  },
  {
    title: 'Projects lose momentum',
    body: 'Without a clear plan, even simple work can turn into wrong parts, stalled weekends, and decisions you have to make twice.',
  },
  {
    title: 'History disappears',
    body: (
      <>
        The oil you used, the filter you picked, the brake pads <WaltName />{' '}
        recommended, and why you chose them should stay with the vehicle.
      </>
    ),
  },
]

const heroMessages = [
  {
    from: 'user',
    text: 'I want to change the oil on Terry’s Rig.',
  },
  {
    from: 'walt',
    text: 'I’ll use the vehicle details, help pick the right supplies, turn it into a project, and save what you used for next time.',
  },
]

const features = [
  {
    number: '01',
    title: 'Garage-first vehicle memory',
    body: (
      <>
        Build a garage around the vehicles you own. <WaltName /> can use the
        year, make, model, trim, engine, notes, and project history to make
        better recommendations.
      </>
    ),
    image: '/line-art/highboy-1-white.png',
    alt: 'Classic truck line art',
    dark: true,
  },
  {
    number: '02',
    title: (
      <>
        <WaltName />-guided project planning
      </>
    ),
    body: (
      <>
        Start with maintenance, diagnostics, repairs, upgrades, or
        restorations. <WaltName /> helps turn the conversation into a draft,
        then a real project plan.
      </>
    ),
    image: '/line-art/c10-front-transparent.png',
    alt: 'C10 line art',
    dark: false,
  },
  {
    number: '03',
    title: 'Parts, decisions, and budget',
    body: 'Track what you need, what you selected, what it costs, where it came from, and why the decision was made.',
    image: '/line-art/911-1-white.png',
    alt: 'Porsche line art',
    dark: true,
  },
  {
    number: '04',
    title: 'Progress that becomes history',
    body: 'Follow the phases and steps, check off completed work, save notes, and keep a record you can come back to next time.',
    image: '/line-art/corvette-66-transparent.png',
    alt: 'Corvette line art',
    dark: false,
  },
]

const howSteps = [
  {
    number: '1',
    title: 'Build your garage',
    body: (
      <>
        Add the vehicles you own and the details <WaltName /> needs to
        understand what you are working on.
      </>
    ),
  },
  {
    number: '2',
    title: (
      <>
        Tell <WaltName /> what you need
      </>
    ),
    body: (
      <>
        Tell <WaltName /> what you want to maintain, diagnose, fix, upgrade, or
        restore.
      </>
    ),
  },
  {
    number: '3',
    title: 'Review the plan',
    body: 'Turn the conversation into phases, steps, tools, notes, references, and warnings.',
  },
  {
    number: '4',
    title: 'Track the details',
    body: 'Keep parts, decisions, budget notes, and progress connected to the project.',
  },
  {
    number: '5',
    title: 'Save the history',
    body: 'Complete the work and keep a record that stays with the vehicle.',
  },
]

const stories = [
  {
    title: 'For the weekend maintainer',
    body: 'Keep oil changes, brake jobs, filters, tire rotations, and completed work tied to the vehicle instead of buried in memory.',
  },
  {
    title: 'For the project builder',
    body: (
      <>
        Plan upgrades, compare parts, adjust the build, and keep <WaltName />{' '}
        aware of the decisions that shape the project.
      </>
    ),
  },
  {
    title: 'For the restorer',
    body: 'Break big work into phases, track progress over time, and keep the vehicle story organized from teardown to final check.',
  },
]

function BYLDitLogo({ footer = false }: { footer?: boolean }) {
  const logoClass = footer ? 'footerLogo' : 'logo'
  const byldClass = footer ? 'footerLogoByld' : 'logoByld'
  const itClass = footer ? 'footerLogoIt' : 'logoIt'

  return (
    <span className={logoClass} aria-label="BYLDit">
      <span className={byldClass}>BYLD</span>
      <span className={itClass}>it</span>
    </span>
  )
}

function BYLDitWord() {
  return (
    <span className="brandWord" aria-label="BYLDit">
      <span className="brandWordByld">BYLD</span>
      <span className="brandWordIt">it</span>
    </span>
  )
}

function WaltName() {
  return <span className="waltName">Walt</span>
}

function HeroLogo() {
  return (
    <span className="heroBadge" aria-label="BYLDit">
      <span className="heroLogoByld">BYLD</span>
      <span className="heroLogoIt">it</span>
    </span>
  )
}

export default function LandingPrototype() {
  return (
    <main className="landingPage">
      <nav className="nav">
        <a href="#top">
          <BYLDitLogo />
        </a>
        <ul className="navLinks">
          <li>
            <a href="#features">Solution</a>
          </li>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <a href="#demo">
              See <BYLDitWord /> in Action
            </a>
          </li>
          <li>
            <a href="/login" className="navCta">
              Get Started
            </a>
          </li>
        </ul>
      </nav>

      <section className="hero" id="top">
        <div className="heroInner">
          <img
            className="heroBackdrop"
            src="/line-art/camaro-front-transparent.png"
            alt=""
          />
          <div className="heroBrandLockup">
            <HeroLogo />
            <span className="poweredBy">
              powered by <strong>Walt</strong>
            </span>
            <img
              className="waltLockupAvatar"
              src="/avatars/walt-v1.png"
              alt="Walt, the BYLDit AI Crew Cheef"
            />
            <span className="waltLockupText">Your AI Crew Cheef</span>
          </div>

          <div className="heroCopy">
            <h1>
              Plan, source, and build with <span className="waltWord">Walt</span>.
            </h1>
            <p className="heroLead">
              <BYLDitWord /> is the vehicle project platform powered by{' '}
              <WaltName />, your AI Crew Cheef for maintenance, diagnostics,
              repairs, upgrades, and restorations.
            </p>
            <div className="projectPills" aria-label="Project types">
              {projectTypes.map((type) => (
                <span className="pill" key={type}>
                  {type}
                </span>
              ))}
            </div>
            <div className="heroButtons">
              <a href="/login" className="btnPrimary">
                Start Your Garage
              </a>
              <a href="#how-it-works" className="btnSecondary">
                See How It Works
              </a>
            </div>
          </div>

          <div className="heroVisual">
            <div className="phoneMockup" aria-label="Example Walt phone conversation">
              <div className="phoneSpeaker" />
              <div className="phoneScreen">
                <div className="phoneHeader">
                  <img src="/avatars/walt-v1.png" alt="" />
                  <div>
                    <span className="phoneWaltLabel">Walt</span>
                    <strong>AI Crew Cheef</strong>
                  </div>
                </div>
                <div className="appScreenTitle">
                  <span>Terry&apos;s Rig</span>
                  <strong>Oil change draft</strong>
                </div>
                <div className="waltChatPreview">
                  {heroMessages.map((message) => (
                    <div
                      className={[
                        'chatRow',
                        message.from === 'walt' ? 'chatRowWalt' : 'chatRowUser',
                      ].join(' ')}
                      key={message.text}
                    >
                      {message.from === 'walt' ? (
                        <img src="/avatars/walt-v1.png" alt="" />
                      ) : null}
                      <div
                        className={[
                          'chatBubble',
                          message.from === 'walt'
                            ? 'chatBubbleWalt'
                            : 'chatBubbleUser',
                        ].join(' ')}
                      >
                        <span>{message.from === 'walt' ? 'Walt' : 'You'}</span>
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="phoneWaltEntry">
                  <span>
                    Ask <WaltName /> about this project...
                  </span>
                  <img src="/avatars/walt-v1.png" alt="" />
                </div>
                <div className="phoneNav" aria-label="BYLDit app navigation">
                  <div className="phoneNavItem active">🏠<span>Garage</span></div>
                  <div className="phoneNavItem">🔧<span>Projects</span></div>
                  <div className="phoneNavItem">🔩<span>Parts</span></div>
                  <div className="phoneNavItem">
                    📋
                    <span>
                      <WaltName />&apos;s Notes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trustBar" aria-label="BYLDit promise">
        <p>Built for real garages, real decisions, and real project history</p>
        <div className="trustStats">
          <div>
            <div className="trustNumber">1</div>
            <div className="trustLabel">garage for every vehicle</div>
          </div>
          <div>
            <div className="trustNumber">5</div>
            <div className="trustLabel">project modes</div>
          </div>
          <div>
            <div className="trustNumber">AI</div>
            <div className="trustLabel">Crew Cheef built in</div>
          </div>
        </div>
      </section>

      <section className="problem">
        <img
          src="/line-art/c10-side-transparent.png"
          alt=""
          className="problemBg"
        />
        <div className="problemInner">
          <div className="sectionLabel">The Problem</div>
          <h2>Vehicle projects get hard when the plan lives everywhere.</h2>
          <p className="problemIntro">
            Whether you are changing oil, chasing a brake issue, planning a
            lift kit, or restoring a truck, the work is easier when the details
            stay connected.
          </p>
          <div className="problemCards">
            {problemCards.map((card) => (
              <article className="problemCard" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="features" id="features">
          <div className="featuresHeader">
            <div className="sectionLabel">The Solution</div>
            <h2>
              <BYLDitWord /> gives every project a place to live.
            </h2>
            <div className="waltAside">
              <img src="/avatars/walt-v1.png" alt="Walt" />
              <p>
                “I keep the garage, the project plan, the parts, the decisions,
                and the history connected.”
              </p>
            </div>
            <p>
              <WaltName /> helps organize the work, but the platform keeps the
              parts, notes, decisions, and progress from getting lost.
            </p>
        </div>

        {features.map((feature, index) => (
          <article
            className={[
              'featureRow',
              index % 2 ? 'featureRowReverse' : '',
              feature.dark ? 'featureRowDark' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={feature.number}
          >
            <div className="featureText">
              <div className="featureNum">{feature.number}</div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
            <div className="featureImage">
              <img src={feature.image} alt={feature.alt} />
            </div>
          </article>
        ))}
      </section>

      <section className="howItWorks" id="how-it-works">
        <img
          src="/line-art/vw-squareback-transparent.png"
          alt=""
          className="howBg"
        />
        <div className="howInner">
          <div className="howHeader">
            <div className="sectionLabel">How It Works</div>
            <h2>From a quick question to a finished project record.</h2>
            <div className="waltAside darkWaltAside">
              <img src="/avatars/walt-v1.png" alt="Walt" />
              <p>
                “Start with the vehicle. I’ll help ask the right questions from
                there.”
              </p>
            </div>
            <p className="howIntro">
              Start simple. <WaltName /> helps you gather the right information,
              then <BYLDitWord /> turns the conversation into something you can
              track.
            </p>
          </div>
          <div className="steps">
            {howSteps.map((step) => (
              <article className="step" key={step.number}>
                <div className="stepNum">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="demo" id="demo">
        <div className="featuresHeader">
          <div className="sectionLabel">
            See <BYLDitWord /> in Action
          </div>
          <h2>
            Your garage, <WaltName />, and the project plan in one place.
          </h2>
          <div className="waltAside">
            <img src="/avatars/walt-v1.png" alt="Walt" />
            <p>
              “Here’s how I turn a vehicle question into a project you can
              actually use.”
            </p>
          </div>
          <p>
            A quick look at how the product comes together once the user has a
            vehicle, a project, and a conversation with <WaltName />.
          </p>
        </div>

        <div className="demoShell">
          <div className="demoPanel">
            <h3>Your garage</h3>
            <article className="garageCard">
              <img src="/photos/f250-hiboy-68.jpg" alt="Classic Ford truck" />
              <div className="garageBody">
                <h4>Terry&apos;s Rig</h4>
                <p>1968 Ford F-250 Highboy</p>
                <div className="statusPills">
                  <span className="statusPill bluePill">1 Open Project</span>
                  <span className="statusPill orangePill">
                    1 Draft Project
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div className="demoPanel demoPanelWide">
            <h3>Project command center</h3>
            <div className="commandPreview">
              <article className="waltPreview">
                <div className="waltPreviewHeader">
                  <img
                    src="/avatars/walt-v1.png"
                    alt="Walt"
                    className="waltPreviewAvatar"
                  />
                  <div>
                    <div className="smallLabel">
                      <WaltName />
                    </div>
                    <h4>Oil change draft</h4>
                  </div>
                </div>
                <p>
                  I have Terry&apos;s Rig pulled in. Want OEM-style service
                  parts, premium oil, or the same setup you used last time?
                </p>
              </article>

              <div className="projectList">
                <article className="projectItem">
                  <div className="projectIcon">1</div>
                  <div>
                    <h4>Prepare vehicle and workspace</h4>
                    <p>Tools, safety, lift points, drain pan, and supplies.</p>
                  </div>
                </article>
                <article className="projectItem">
                  <div className="projectIcon">2</div>
                  <div>
                    <h4>Drain oil and inspect</h4>
                    <p>Step-by-step guidance with notes and warnings.</p>
                  </div>
                </article>
                <article className="projectItem">
                  <div className="projectIcon">3</div>
                  <div>
                    <h4>Refill, check, and save history</h4>
                    <p>Parts used, mileage, notes, and completed record.</p>
                  </div>
                </article>
              </div>
            </div>

            <div className="decisionStrip">
              <div>
                <span>Parts</span>
                <strong>Filter + oil saved</strong>
              </div>
              <div>
                <span>Decision</span>
                <strong>Premium synthetic</strong>
              </div>
              <div>
                <span>History</span>
                <strong>Ready for next service</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stories">
        <div className="storiesHeader">
          <div className="sectionLabel">Built For</div>
          <h2>Simple work, big builds, and everything between.</h2>
          <p>
            <BYLDitWord /> should feel useful whether someone is doing a
            Saturday service or planning a multi-year restoration.
          </p>
        </div>
        <div className="storyCards">
          {stories.map((story) => (
            <article className="storyCard" key={story.title}>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>
          Ready to build your garage around <WaltName />?
        </h2>
        <p>
          Start with one vehicle, one conversation, and one project.{' '}
          <BYLDitWord /> keeps the work organized from there.
        </p>
        <a href="/login" className="btnPrimary">
          Start Your Garage
        </a>
      </section>

      <footer className="footer">
        <img
          src="/line-art/datsun-510-transparent.png"
          alt=""
          className="footerBg"
        />
        <div className="footerContent">
          <div className="footerBrand">
            <BYLDitLogo footer />
            <p>
              Helping vehicle owners plan, source, track, and finish projects
              with <WaltName />, their AI Crew Cheef.
            </p>
          </div>
          <div className="footerCol">
            <h4>Product</h4>
            <a href="#features">Solution</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#">Pricing</a>
            <a href="#">Roadmap</a>
          </div>
          <div className="footerCol">
            <h4>Resources</h4>
            <a href="#">Build Guides</a>
            <a href="#">Parts Directory</a>
            <a href="#">
              <WaltName /> Notes
            </a>
            <a href="#">Community</a>
          </div>
          <div className="footerCol">
            <h4>Company</h4>
            <a href="#">About the Company</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="footerBottom">
          <p>© 2026 <BYLDitWord />. All rights reserved.</p>
          <div className="footerTagline">
            Plan it. Source it. <BYLDitWord />.
          </div>
        </div>
      </footer>
    </main>
  )
}
