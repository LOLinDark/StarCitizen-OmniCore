// Onboarding Checklist Data Structure
// Organized by sections with tasks and metadata

export const onboardingChecklist = [
  {
    id: 'account-setup',
    title: 'Account Setup',
    subtitle: 'Get your Star Citizen account ready',
    icon: '👤',
    color: '#00d9ff',
    description: 'Create and configure your official RSI account to access the game and community',
    tasks: [
      {
        id: 'task-rsi-account',
        title: 'Create RSI Account',
        badge: 'Essential',
        badgeColor: 'cyan',
        description: 'Visit Roberts Space Industries and create your official account. You\'ll need this to register the game, access the launcher, and manage your pledge.',
        cta: {
          label: 'Go to RSI Website',
          action: () => window.open('https://www.robertsspaceindustries.com/enlist?referral=STAR-TBYK-XVFK', '_blank'),
        },
        completed: false,
      },
      {
        id: 'task-hotas-config',
        title: 'Learn About HOTAS Configuration',
        badge: 'Recommended',
        badgeColor: 'orange',
        description: 'Star Citizen supports advanced flight controls including HOTAS (Hands-On Throttle-And-Stick) systems. We have a dedicated HOTAS configuration tool available in OmniCore to help you set up your controls perfectly. Check it out when you\'re ready to customize your keybindings.',
        cta: {
          label: 'View HOTAS Tool (Coming Soon)',
          action: () => console.log('HOTAS tool not yet available'),
        },
        completed: false,
      },
    ],
  },
  {
    id: 'community',
    title: 'Join the Community',
    subtitle: 'Connect with other Star Citizen players',
    icon: '👥',
    color: '#00ff88',
    description: 'Join our thriving community and meet fellow players',
    tasks: [
      {
        id: 'task-discord',
        title: 'Join Official Discord',
        badge: 'Essential',
        badgeColor: 'cyan',
        description: 'Our Discord server is the hub for real-time discussions, LFG (Looking For Group), trading, and community events. Get help from experienced players and meet your future squadron mates.',
        cta: {
          label: 'Join Discord',
          action: () => window.open('https://discord.gg/starcitizen', '_blank'),
        },
        completed: false,
      },
      {
        id: 'task-forums',
        title: 'Explore Community Forums',
        badge: 'Optional',
        badgeColor: 'gray',
        description: 'The official RSI forums are great for longer-form discussions, bug reports, and in-depth guides. Browse the Star Citizen section to learn from experienced players.',
        cta: {
          label: 'Visit Forums',
          action: () => window.open('https://robertsspaceindustries.com/spectrum/community', '_blank'),
        },
        completed: false,
      },
      {
        id: 'task-wiki',
        title: 'Check Out the Community Wiki',
        badge: 'Helpful',
        badgeColor: 'blue',
        description: 'The Star Citizen Wiki is maintained by players and contains everything from game mechanics to location guides. It\'s an invaluable resource for new and veteran players.',
        cta: {
          label: 'Visit Star Citizen Wiki',
          action: () => window.open('https://starcitizen.tools', '_blank'),
        },
        completed: false,
      },
    ],
  },
  {
    id: 'game-setup',
    title: 'Game Setup',
    subtitle: 'Configure your game environment',
    icon: '⚙️',
    color: '#ff6b00',
    description: 'Prepare your system for Star Citizen',
    tasks: [
      {
        id: 'task-launcher',
        title: 'RSI Launcher Ready',
        badge: 'Essential',
        badgeColor: 'cyan',
        description: 'You\'ll need the official RSI Launcher to download and play Star Citizen. It manages game updates, patches, and settings. Download it from the official website.',
        cta: {
          label: 'Download Launcher',
          action: () => window.open('https://www.robertsspaceindustries.com/download', '_blank'),
        },
        completed: false,
      },
      {
        id: 'task-system-check',
        title: 'Check System Requirements',
        badge: 'Recommended',
        badgeColor: 'orange',
        description: 'Star Citizen is demanding software. Make sure your system meets the minimum requirements: SSD (very important!), 16GB RAM, modern GPU. Visit the official specs page to verify.',
        cta: {
          label: 'View System Requirements',
          action: () => window.open('https://robertsspaceindustries.com/download', '_blank'),
        },
        completed: false,
      },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    subtitle: 'Learn the essentials',
    icon: '📚',
    color: '#b300ff',
    description: 'Get familiar with Star Citizen basics',
    tasks: [
      {
        id: 'task-controls',
        title: 'Understand Basic Controls',
        badge: 'Essential',
        badgeColor: 'cyan',
        description: 'Star Citizen has extensive controls for piloting, combat, interaction, and more. Start with the basics: movement, landing, and docking. The game includes a tutorial to help you get started.',
        cta: {
          label: 'Tutorial Guide',
          action: () => window.open('https://starcitizen.tools/Tutorials', '_blank'),
        },
        completed: false,
      },
      {
        id: 'task-faq-1',
        title: 'Top 10 FAQ: What should I do first?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'After logging in, you\'ll spawn in your starting location. Complete the initial mission, visit your home base, and explore nearby space stations. Don\'t rush—take time to learn the UI and get comfortable with controls.',
        completed: false,
      },
      {
        id: 'task-faq-2',
        title: 'Top 10 FAQ: How do I make money?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Star Citizen offers various professions: mining, trading, bounty hunting, salvage, escort missions, and more. Start with simple missions (contract board) to earn UEC (in-game currency), then progress to more challenging activities.',
        completed: false,
      },
      {
        id: 'task-faq-3',
        title: 'Top 10 FAQ: What\'s the difference between ships?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Each ship is specialized: fighters for combat, haulers for cargo, explorers for discovery, etc. Start with your starter ship to learn mechanics, then specialize based on your play style. You don\'t need to own all ships—you can rent or borrow.',
        completed: false,
      },
      {
        id: 'task-faq-4',
        title: 'Top 10 FAQ: Is the game complete?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Star Citizen is in active development (Alpha). The game is playable now with tons of content, but expect bugs, wipes, and changes. This is your chance to help shape the game\'s future and enjoy early access to groundbreaking gameplay.',
        completed: false,
      },
      {
        id: 'task-faq-5',
        title: 'Top 10 FAQ: Can I play solo?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Absolutely! Solo play is supported. Fly alone, run missions, explore. However, many systems are designed for groups (especially combat and large-scale missions), so multiplayer is encouraged but optional.',
        completed: false,
      },
      {
        id: 'task-faq-6',
        title: 'Top 10 FAQ: What\'s the learning curve?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Moderate-to-high. The game has deep mechanics for flying, combat, trading, and interaction. The tutorial helps, but watching community guides and joining a player organization will accelerate learning. Don\'t get discouraged—everyone starts as a rookie.',
        completed: false,
      },
      {
        id: 'task-faq-7',
        title: 'Top 10 FAQ: How do player orgs work?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Player organizations (orgs) are guilds/corporations. They range from casual hangout groups to hardcore military units. Joining an org provides community, teamwork, and organized events. Many orgs welcome new players and help them learn.',
        completed: false,
      },
      {
        id: 'task-faq-8',
        title: 'Top 10 FAQ: What happens if I die?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'You respawn with no penalty (except lost time). Lost items respawn in your inventory. If your ship is destroyed, you can recover it or spawn a new one. Death is temporary—embrace it and learn from mistakes.',
        completed: false,
      },
      {
        id: 'task-faq-9',
        title: 'Top 10 FAQ: How do I find squadmates?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Use in-game chat, Discord LFG channels, the community forums, or join an org. Many experienced players love helping newcomers, especially in multiplayer missions. Don\'t be shy about asking for guidance.',
        completed: false,
      },
      {
        id: 'task-faq-10',
        title: 'Top 10 FAQ: What\'s the roadmap?',
        badge: 'Read',
        badgeColor: 'gray',
        description: 'Cloud Imperium publishes development updates regularly. Check the official roadmap to see what\'s coming next. Features like new ships, systems, professions, and gameplay loops are constantly being added.',
        completed: false,
      },
    ],
  },
];

// Helper function to get all tasks across all sections
export const getAllTasks = () => {
  return onboardingChecklist.reduce((acc, section) => [...acc, ...section.tasks], []);
};

// Helper function to get total task count
export const getTotalTaskCount = () => {
  return getAllTasks().length;
};

// Helper function to filter by category
export const getTasksBySection = (sectionId) => {
  const section = onboardingChecklist.find(s => s.id === sectionId);
  return section?.tasks || [];
};
