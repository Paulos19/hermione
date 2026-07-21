export const dictionaries = {
  en: {
    heroPrefix: "Writing without complexity — ",
    typingPhrases: [
      "clear, smart, and designed to work for you.",
      "an editor that understands your universe.",
      "multiplayer collaboration with zero latency."
    ],
    heroSubtitle: "Take full control of your creative process with a collaborative editor that feels like magic.",
    nav: {
      product: "Product",
      methodology: "Methodology",
      company: "Company",
      signIn: "Sign In",
      start: "Start Creating"
    },
    chat: {
      initialGreeting: "Hi! I'm Hermione. What do you want to write about today?",
      genericResponse: "Interesting... What else would you like to add to this idea?",
      signupCall: "It was amazing chatting with you! To continue our creation and access all advanced tools, please create your free account.",
      inputPlaceholder: "Type your message...",
      signUpButton: "Create Free Account"
    },
    mobileSection: {
      title: "Your studio, always in your pocket.",
      subtitle: "All the power of Hermione synced in real-time to your mobile device with the Chat Secret app. Create, review, and collaborate wherever you are.",
      features: {
        sync: "Real-time Sync",
        offline: "Offline Access",
        ai: "Native AI Chat"
      },
      cta: "Explore Chat Secret"
    }
  },
  pt: {
    heroPrefix: "Escrita sem complexidade — ",
    typingPhrases: [
      "clara, inteligente e desenhada para você.",
      "um editor que entende o seu universo.",
      "colaboração multiplayer com latência zero."
    ],
    heroSubtitle: "Assuma o controle total do seu processo criativo com um editor colaborativo que parece mágica.",
    nav: {
      product: "Produto",
      methodology: "Metodologia",
      company: "Empresa",
      signIn: "Entrar",
      start: "Começar Grátis"
    },
    chat: {
      initialGreeting: "Olá! Eu sou a Hermione. Sobre o que você quer escrever hoje?",
      genericResponse: "Interessante... O que mais você gostaria de explorar sobre isso?",
      signupCall: "Foi incrível conversar com você! Para continuarmos nossa criação e acessar todas as ferramentas, crie sua conta gratuita.",
      inputPlaceholder: "Digite sua mensagem...",
      signUpButton: "Criar Conta Grátis"
    },
    mobileSection: {
      title: "Seu estúdio, sempre no seu bolso.",
      subtitle: "Toda a potência da Hermione sincronizada em tempo real no seu dispositivo móvel com o aplicativo Chat Secret. Crie, revise e colabore de onde estiver.",
      features: {
        sync: "Sincronização Yjs",
        offline: "Acesso Offline",
        ai: "Chat AI Nativo"
      },
      cta: "Explorar Chat Secret"
    }
  },
  es: {
    heroPrefix: "Escritura sin complejidad — ",
    typingPhrases: [
      "clara, inteligente y diseñada para ti.",
      "un editor que entiende tu universo.",
      "colaboración multijugador con latencia cero."
    ],
    heroSubtitle: "Toma el control total de tu proceso creativo con un editor colaborativo que se siente como magia.",
    nav: {
      product: "Producto",
      methodology: "Metodología",
      company: "Empresa",
      signIn: "Iniciar sesión",
      start: "Empezar Gratis"
    },
    chat: {
      initialGreeting: "¡Hola! Soy Hermione. ¿De qué quieres escribir hoy?",
      genericResponse: "Interesante... ¿Qué más te gustaría añadir a esta idea?",
      signupCall: "¡Fue increíble hablar contigo! Para continuar nuestra creación y acceder a todas las herramientas, crea tu cuenta gratuita.",
      inputPlaceholder: "Escribe tu mensaje...",
      signUpButton: "Crear Cuenta Gratis"
    },
    mobileSection: {
      title: "Tu estudio, siempre en tu bolsillo.",
      subtitle: "Todo el poder de Hermione sincronizado en tiempo real en tu dispositivo móvil con la app Chat Secret. Crea, revisa y colabora desde cualquier lugar.",
      features: {
        sync: "Sincronización en tiempo real",
        offline: "Acceso Offline",
        ai: "Chat AI Nativo"
      },
      cta: "Explorar Chat Secret"
    }
  }
};

export type ValidLang = keyof typeof dictionaries;
