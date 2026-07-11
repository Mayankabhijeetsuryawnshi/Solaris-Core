# DEVELOPMENT.md

> *Software projects rarely follow a straight path from idea to implementation. Solaris evolved through experimentation, redesign, debugging, and continuous learning. This document records that process. It explains why the project exists, how the initial architecture was formed, the reasoning behind the technology stack, and the decisions that shaped the first versions of the application.*

---

# Table of Contents

* Why I Built Solaris
* The Original Idea
* Defining the Project Goals
* Planning Before Writing Code
* Choosing the Technology Stack
* Building the First Prototype
* Early Architecture
* Initial Lessons

---

# Why I Built Solaris

Solaris did not begin as an attempt to create another AI chatbot.

The original motivation was much simpler.

I wanted to understand how modern software is actually engineered.

When I first started learning web development, I quickly realized that following tutorials only teaches isolated techniques. You learn how to build a login page, a dashboard, or a small application, but very little about designing a system that can continue growing without becoming difficult to maintain.

I wanted a project that would force me to solve real engineering problems instead of reproducing examples from documentation.

Artificial intelligence happened to provide the perfect foundation.

It combines frontend development, backend communication, API integration, asynchronous programming, responsive design, state management, software architecture, and user experience into a single project. Every new feature introduced another opportunity to learn something that I had never built before.

From the beginning, Solaris was intended to be more than a finished application.

It became a practical environment where I could experiment with unfamiliar technologies, test architectural ideas, make mistakes, and gradually improve the system through iteration.

Looking back, the project reflects my own progression as much as it reflects the software itself.

Early components were relatively simple.

Later revisions became increasingly modular.

Documentation became more detailed.

The architecture became cleaner.

Every improvement came from understanding why earlier implementations were becoming difficult to extend.

That learning process continues with every new feature.

---

# The Original Idea

The earliest concept looked nothing like the current version of Solaris.

Initially, I imagined a clean interface where users could ask questions to an AI model and receive well-formatted responses. That objective was achievable, but it quickly became obvious that building another chat application would teach me very little after the initial implementation.

The more I worked on the project, the more I realized that the interesting challenges existed outside the conversation itself.

How should requests move through the application?

Where should provider-specific logic live?

How should components communicate?

How should animations remain smooth while AI requests are still processing?

How should new modules be added without restructuring the application?

These questions gradually became more important than simply displaying generated text.

Instead of expanding the chat interface, I began expanding the architecture around it.

The AI remained the central capability, but the surrounding infrastructure became the real engineering challenge.

That shift changed the direction of the project entirely.

Rather than building a single feature, Solaris became a modular workspace designed to support future capabilities without requiring major redesigns.

---

# Defining the Project Goals

Before writing significant amounts of code, I established several principles that would guide development.

The project should prioritize learning over speed.

Features should be modular.

The application should remain understandable even as complexity increases.

Documentation should evolve alongside implementation instead of being written only after development finishes.

Artificial intelligence should enhance the workflow rather than dominate it.

Most importantly, I wanted every major feature to teach me something new.

Whenever a feature became repetitive or stopped introducing new engineering challenges, I shifted my attention toward a different area of the project.

This approach naturally expanded the technical scope of Solaris.

Frontend architecture introduced React and TypeScript.

Backend communication introduced Express.

Interactive graphics encouraged experimenting with Three.js.

AI integration required understanding modern language model APIs.

Documentation became an opportunity to practice technical writing alongside software development.

Rather than treating these subjects independently, Solaris gradually combined them into a single engineering project.

---

# Planning Before Writing Code

One lesson became obvious surprisingly early.

Writing code without a rough plan often created more work than it saved.

Early prototypes occasionally grew quickly because adding new functionality felt easier than reorganizing existing code.

Over time, those rapid additions made the project increasingly difficult to understand.

Introducing one new feature often required modifying several unrelated files.

Refactoring became inevitable.

Instead of viewing planning as unnecessary overhead, I began treating it as part of development.

Before implementing larger features, I started asking several questions.

What responsibility should this module own?

Could this feature be reused elsewhere?

Does this belong inside the component, or should it become a shared service?

Will adding another provider require rewriting this code?

How will this behave six months from now instead of today?

Those questions rarely produced immediate answers.

They did, however, reduce architectural problems that would otherwise appear much later.

Planning gradually became less about predicting every implementation detail and more about defining clear boundaries between systems.

---

# Choosing the Technology Stack

Selecting the technology stack required balancing two different goals.

I wanted modern tools that reflected current industry practices.

I also wanted technologies that would challenge me enough to encourage learning without becoming overwhelming.

Every major technology included in Solaris was chosen because it solved a particular problem rather than because it was popular.

---

## React

React became the foundation of the frontend because it encourages modular user interfaces built from reusable components.

Instead of creating large monolithic pages, I could organize the interface into smaller building blocks with clearly defined responsibilities.

This component-oriented mindset influenced the rest of the project's architecture.

As Solaris expanded, React made it easier to introduce new modules while preserving a consistent user experience.

---

## TypeScript

JavaScript offered flexibility.

TypeScript added structure.

As the project grew beyond a few files, stronger type checking became increasingly valuable.

Interfaces became easier to understand.

Refactoring became safer.

Unexpected runtime errors became easier to detect during development.

Although learning TypeScript introduced additional complexity at first, the long-term benefits became obvious as the application continued expanding.

---

## Express

The frontend needed a secure way to communicate with external AI providers.

Connecting directly from the browser would expose API credentials while tightly coupling the interface to a specific provider.

Express provided a lightweight backend that could handle communication, validation, request formatting, and future expansion without introducing unnecessary complexity.

Keeping this layer separate also made the frontend considerably cleaner.

---

## Google Gemini

Several language models were available during development.

Gemini was selected because it provided a practical balance between capabilities, accessibility, documentation, and integration simplicity.

The surrounding architecture intentionally avoids depending exclusively on Gemini.

The backend communicates through an abstraction layer so that different providers can eventually be introduced without changing the frontend.

This decision reflects one of the recurring themes throughout Solaris.

Dependencies should remain replaceable whenever practical.

---

## Vite

Development speed matters when experimenting frequently.

Vite provided an excellent developer experience through fast startup times, efficient module updates, and optimized production builds.

Rather than spending time waiting for rebuilds, I could iterate quickly while exploring new ideas.

That shorter feedback loop encouraged experimentation throughout development.

---

# Building the First Prototype

The first working version of Solaris was intentionally modest.

It consisted of a basic interface capable of accepting user input, sending requests to an AI model, and displaying generated responses.

Functionally, it achieved its objective.

Architecturally, it revealed many weaknesses.

Presentation logic mixed with request handling.

Components accumulated multiple responsibilities.

Application structure reflected the order in which features had been implemented rather than a deliberate design.

At the time, those compromises felt reasonable because the application remained small.

As additional features appeared, they became increasingly difficult to ignore.

Rather than continuing to build on an increasingly fragile foundation, I began reorganizing the project into smaller, more focused systems.

That refactoring process ultimately shaped much of the architecture that exists today.

---

# Early Architecture

The first architecture emphasized functionality over organization.

Features worked, but relationships between modules were often unclear.

Several responsibilities existed inside the same components simply because they had been implemented together.

Over time, I started separating those responsibilities.

Presentation moved into reusable components.

Backend communication became shared services.

Application state became more localized.

Routing gained clearer boundaries.

As each system became more independent, the project became easier to understand, easier to debug, and considerably easier to expand.

This gradual transition from feature-first development toward architecture-first development became one of the defining characteristics of Solaris.

---

# Initial Lessons

The earliest months of development taught lessons that continue influencing the project today.

Writing working code is only one part of software engineering.

Organizing that code determines how easily the project can evolve.

Adding features without considering architecture eventually slows development rather than accelerating it.

Refactoring is not evidence that earlier work failed.

It is evidence that the project has grown beyond its original assumptions.

Perhaps the most valuable realization was that every iteration improves understanding.

Many systems inside Solaris exist in their current form because earlier implementations revealed what did not scale well.

Instead of treating those revisions as mistakes, I began viewing them as part of the engineering process itself.

That mindset continues to guide development as Solaris becomes larger, more capable, and more technically ambitious.

---

# DEVELOPMENT.md

---

# Building the Frontend

The frontend became the largest visible part of Solaris because it is where every system eventually reaches the user.

At first, the goal was simply to create an interface that could send prompts and display responses. As development continued, the focus shifted from making individual screens work toward creating a consistent environment where different capabilities could coexist.

This required thinking beyond individual components.

A button was no longer just a button.

A panel was no longer just a panel.

Every interface element became part of a larger system with its own responsibilities, state, and relationship with other modules.

---

# Moving From Pages to Components

One of the earliest frontend challenges was avoiding the creation of large components that controlled everything.

A single component handling the interface, AI communication, animations, and state management may work during early development, but it becomes increasingly difficult to modify as features are added.

The solution was moving toward a component-based architecture.

Instead of asking:

"How do I build this entire page?"

the approach became:

"What smaller systems combine to create this experience?"

This changed the way new features were implemented.

A module could be developed independently.

A visual component could be improved without affecting backend logic.

A service could change without rewriting the interface.

This separation became one of the most important architectural improvements in Solaris.

---

# Component Design Approach

The frontend gradually developed around three main principles.

## Clear Responsibility

Each component should have a reason to exist.

A component responsible for navigation should not manage AI requests.

A conversation interface should not control unrelated application settings.

A visual effect should not contain business logic.

Keeping responsibilities clear made individual systems easier to understand and improve.

---

## Reusable Systems

Repeated interface patterns were converted into reusable components.

This reduced duplicated code and created consistency throughout the application.

Instead of solving the same problem multiple times, improvements could be applied once and used everywhere.

This approach also made experimentation easier because new features could build on existing foundations.

---

## Separation Between Logic and Presentation

One of the biggest improvements came from separating what the application does from what the user sees.

The interface should display information.

Services should handle communication.

Utilities should process reusable operations.

This separation reduced complexity and made debugging significantly easier.

---

# Building the AI Interface

The AI interface introduced several unique frontend challenges.

Unlike a traditional form submission, conversations require continuous state changes.

The interface must handle:

* User input
* Sending requests
* Loading states
* Generated responses
* Errors
* Formatting
* Conversation history

Each stage represents a different state of the application.

Early versions handled these transitions directly inside interface components.

As the system expanded, this approach became difficult to maintain.

The solution was introducing clearer boundaries between the user interface and the underlying AI service.

The frontend became responsible for interaction.

The backend became responsible for communication.

The AI provider remained isolated behind those layers.

---

# Handling Asynchronous Behaviour

AI responses are fundamentally asynchronous.

A user can submit a request and receive the result several seconds later.

During that time, the application must remain responsive.

This required careful handling of application states.

The interface needed to communicate:

* A request has started.
* The system is processing.
* A response has arrived.
* Something went wrong.

Small details became important.

A loading indicator prevents uncertainty.

A disabled button prevents duplicate requests.

A clear error message helps users recover.

These interactions are simple individually, but together they define the quality of the experience.

---

# Backend Development

The backend was introduced because the frontend needed a controlled communication layer between the application and external services.

A direct connection between the browser and an AI provider may appear simpler, but it creates several limitations.

API credentials become exposed.

Provider-specific logic spreads throughout the frontend.

Changing models becomes more difficult.

Future authentication becomes harder to introduce.

The backend solved these problems by creating a controlled gateway.

---

# Express Server Architecture

The backend follows a lightweight structure.

Its purpose is not to perform unnecessary computation.

Instead, it coordinates communication.

```text
Backend

│

├── Request Handling

├── Validation

├── AI Communication

├── Response Processing

└── Future Services
```

Keeping this layer focused prevents it from becoming another source of complexity.

The backend exists to support the application, not to replace the frontend.

---

# API Design Decisions

One important lesson during backend development was that APIs should represent application actions rather than external services.

Instead of designing the frontend around Gemini's API structure, Solaris communicates through internal endpoints.

This creates a layer of independence.

The application understands what it needs.

The backend decides how those needs are fulfilled.

This distinction becomes increasingly valuable as projects grow.

---

# AI Integration Process

Integrating artificial intelligence was one of the most interesting parts of Solaris because the technical challenge extended beyond simply connecting an API.

Sending a prompt was easy.

Designing a system around that interaction was harder.

Several questions appeared during development.

How should requests be structured?

Where should conversation history exist?

How should responses be displayed?

How can another model be introduced later?

How should failures be handled?

Answering these questions required treating AI as an engineering subsystem rather than a single feature.

---

# Working With AI During Development

AI tools were used throughout development as part of the learning and engineering process.

They helped with:

* Understanding unfamiliar documentation
* Exploring possible implementations
* Debugging problems
* Reviewing approaches
* Generating initial ideas
* Improving documentation

However, the final implementation required manual decisions, testing, modification, and integration.

Generated suggestions often required adaptation because every project has different requirements.

A solution that works in isolation may not fit the architecture of a larger system.

The process involved evaluating ideas, modifying them, and understanding why specific approaches were appropriate.

AI accelerated exploration, but engineering judgment determined the final result.

---

# Three.js Experiments

Adding interactive graphics introduced an entirely different development challenge.

Traditional web interfaces operate primarily through HTML, CSS, and React rendering.

Three.js introduces real-time graphics, cameras, scenes, lighting, objects, and GPU-based rendering.

The development process changed significantly.

Instead of thinking only about components, I had to consider:

* Rendering loops
* Performance constraints
* Object management
* Memory usage
* GPU resources
* Animation timing

---

# Learning Real-Time Graphics

The first experiments with Three.js focused on understanding the fundamentals.

Creating objects.

Positioning cameras.

Adding lighting.

Animating scenes.

These small experiments helped establish how 3D environments function before attempting more complex integrations.

One important realization was that visual complexity has a direct performance cost.

A scene can look impressive while still being inefficient.

Good graphics require balancing appearance with technical limitations.

---

# Integrating Three.js With React

Combining React and Three.js required careful separation.

React manages interface state and user interaction.

Three.js manages the rendering environment.

Trying to control everything through React alone creates unnecessary complexity.

The solution was allowing each technology to handle the area where it performs best.

React controls application logic.

Three.js controls the graphical environment.

This separation follows the same architectural philosophy used throughout Solaris.

---

# Major Technical Challenges

Several challenges appeared repeatedly during development.

## Managing Complexity

The application grew faster than the original architecture expected.

Features that were simple individually became complicated when combined.

The solution was restructuring systems instead of continuously adding more code.

---

## Understanding New Technologies

Many technologies used in Solaris were unfamiliar during initial implementation.

Learning required more than reading documentation.

Concepts became clearer through experimentation, failure, debugging, and rebuilding.

---

## Avoiding Overengineering

A common challenge was deciding when abstraction was useful.

It is easy to design systems for problems that do not exist yet.

It is also easy to create simple solutions that become impossible to extend later.

Finding the balance required continuous evaluation.

---

# Refactoring Journey

Refactoring became a regular part of Solaris development.

Early implementations were not discarded because they were useless.

They revealed limitations.

Each redesign answered a question raised by the previous version.

Could this component be reused?

Can this service be separated?

Can this logic become independent?

Does this architecture support future features?

Over time, these questions shaped the current structure of the project.

Refactoring became less about fixing mistakes and more about improving the system as new understanding developed.

---

# Engineering Decisions

Several decisions repeatedly influenced development.

Keeping AI communication separate from the frontend improved flexibility.

Building reusable components reduced duplication.

Writing documentation alongside development improved clarity.

Using modern tools encouraged experimentation.

Prioritizing understanding over simply finishing features produced better long-term results.

The development process of Solaris was therefore not only about creating an application.

It was about learning how software systems are designed, maintained, and improved over time.

---

# DEVELOPMENT.md

---

# Lessons Learned

Building Solaris changed the way I think about software development.

At the beginning, development felt mostly like a process of learning syntax and making features work. Over time, the focus shifted toward understanding systems, trade-offs, and the reasoning behind engineering decisions.

A working application is only the visible result.

Behind it are hundreds of smaller decisions.

Where should this logic exist?

How should these systems communicate?

What happens when the application becomes ten times larger?

What problems will appear later because of a decision made today?

Learning to ask these questions became one of the most valuable outcomes of the project.

---

# Architecture Matters More Than Expected

One of the biggest lessons from Solaris was understanding the impact of architecture.

Early versions focused mainly on functionality.

If a feature worked, it felt like progress.

That approach is useful at the beginning, but it has limits.

As the project expanded, small architectural weaknesses became larger problems.

Components became harder to modify.

Logic became duplicated.

New features required changes in unexpected places.

The solution was not adding more code.

The solution was improving the structure of the existing code.

Separating responsibilities, creating clearer boundaries, and simplifying communication between systems produced larger improvements than simply adding new features.

A good architecture does not remove complexity.

It organizes complexity so that it remains manageable.

---

# Learning Through Iteration

Solaris was not built perfectly from the first version.

Several systems went through multiple revisions.

Some implementations were replaced completely.

Some ideas that seemed useful initially became unnecessary after testing.

This process changed how I viewed mistakes.

An early implementation is not wasted work if it reveals something important about the system.

Each iteration provided new information.

A component that became difficult to maintain showed where boundaries needed improvement.

A slow feature revealed where unnecessary processing existed.

A confusing workflow revealed where the user experience needed refinement.

Development became a cycle of building, evaluating, improving, and rebuilding.

---

# The Importance of Documentation

Documentation became a larger part of Solaris than originally expected.

At first, documentation seemed like something written after the code was complete.

That changed during development.

Writing about architecture forced clearer thinking.

Explaining a system often revealed problems that were not obvious while coding.

If a feature was difficult to explain, it was often difficult to maintain.

Documents such as:

* `README.md`
* `ARCHITECTURE.md`
* `FEATURES.md`
* `AI_SYSTEM.md`
* `PERFORMANCE.md`

became more than descriptions.

They became design references that helped maintain consistency throughout development.

---

# What AI Helped With

Artificial intelligence played an important role throughout the development of Solaris.

Modern AI tools were used as development assistants during different stages of the project.

They helped accelerate:

* Research into unfamiliar technologies
* Understanding technical documentation
* Exploring implementation approaches
* Debugging assistance
* Code review discussions
* Documentation drafting
* Learning new concepts

AI was especially useful when entering areas outside my previous experience.

For example, understanding unfamiliar backend patterns, exploring graphics concepts, or researching software architecture became faster with an interactive assistant available for explanation.

However, using AI effectively required understanding its limitations.

Generated code is not automatically correct.

Suggested architectures may not fit the project's requirements.

A solution that works in a small example may create problems inside a larger system.

Every AI-assisted idea still required evaluation, modification, testing, and integration.

---

# What Was Built Through My Own Engineering

Although AI tools supported parts of the development process, Solaris was shaped through hands-on engineering decisions.

The project direction, architecture, feature selection, integration choices, debugging, customization, and continuous improvements required active development.

Important parts of the process included:

* Designing how systems communicate
* Choosing where responsibilities belong
* Adapting generated suggestions to the project
* Debugging unexpected behaviour
* Testing different approaches
* Refactoring outdated implementations
* Deciding which features actually improved the application

AI provided acceleration.

The engineering process determined the final result.

This distinction matters because software development is not simply producing code. It is understanding why code exists, how it affects other systems, and when it should change.

---

# Working With Unfamiliar Technologies

Solaris introduced several technologies that required learning from the ground up.

React introduced component-based interface design.

TypeScript introduced stronger structure and safer development.

Express introduced backend architecture.

AI APIs introduced external service integration.

Three.js introduced real-time graphics.

Each technology required a different learning approach.

Reading documentation provided the foundation.

Small experiments built understanding.

Actual integration revealed the difficult parts.

The most valuable learning happened when separate technologies interacted.

A technology rarely exists alone in real applications.

Understanding how systems connect became more important than memorizing individual tools.

---

# Balancing Features and Quality

A recurring challenge throughout development was deciding what should be built next.

Adding features creates visible progress.

Improving existing systems creates invisible progress.

Both are necessary.

A new feature may make the application more capable.

A refactor may make future features possible.

Choosing between them required considering the long-term direction of the project rather than focusing only on immediate results.

This balance influenced Solaris' development strategy.

New functionality was added, but existing systems were continuously improved to support future expansion.

---

# Future Development

Solaris is designed as an evolving project.

The current version represents a foundation rather than a final destination.

Future development areas include improving AI capabilities, expanding workspace functionality, enhancing visual systems, introducing deeper project integration, and exploring more advanced developer tools.

Potential future directions include:

* Persistent user workspaces
* Advanced AI memory systems
* Multiple AI provider support
* Local model integration
* Plugin architecture
* More interactive visualizations
* Developer-focused automation tools
* Collaborative features

These ideas are guided by the same principle that shaped the project from the beginning.

New capabilities should extend the system without making the architecture harder to understand.

---

# Contribution Guidelines

Although Solaris began as a personal engineering project, future contributors should approach development with the same principles that shaped the existing architecture.

Before adding major features:

Understand the current structure.

Identify where the feature belongs.

Avoid unnecessary coupling.

Keep responsibilities clear.

Document important architectural decisions.

A contribution should improve the system, not simply add more code.

Good software development requires considering the impact of changes beyond the immediate feature being implemented.

---

# Development Philosophy

The development philosophy behind Solaris can be summarized through a few ideas.

Build to learn.

Design for change.

Keep systems understandable.

Use tools intelligently.

Improve through iteration.

The project was created as a practical way to explore modern software engineering, but the lessons extend beyond one application.

Building software is a continuous process of making decisions with incomplete information, learning from results, and improving the system over time.

---

# Final Reflection

Solaris represents a journey from building individual features toward understanding complete systems.

The project started with a simple goal: create an application powered by artificial intelligence.

It gradually became something much broader.

It became a place to experiment with architecture, frontend engineering, backend development, AI integration, graphics programming, performance optimization, and technical documentation.

The most valuable outcome is not a specific feature or technology used inside the project.

It is the understanding gained from building, breaking, redesigning, and improving a real system.

Future versions of Solaris will continue changing.

Some technologies may be replaced.

Some ideas may evolve.

Some architectural decisions may be revisited.

That is part of software development.

A strong project is not one that never changes.

It is one that can change without losing its foundation.

---

**End of `DEVELOPMENT.md`**
