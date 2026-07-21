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
    }
  }
};

export type ValidLang = keyof typeof dictionaries;
