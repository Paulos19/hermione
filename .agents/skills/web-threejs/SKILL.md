---
name: web-threejs
description: Reconstrução 3D procedural e criação de componentes Three.js em TypeScript a partir de imagens de referência ou especificações de design utilizando os princípios e pipeline da img2threejs.
---

# 🛠️ Agent Skill: img2threejs - Procedural 3D Builder

## Contexto e Missão
Esta skill guia a reconstrução procedural 3D de objetos, estruturas, artefatos ou dispositivos a partir de imagens de referência. O objetivo é gerar um modelo Three.js puramente via código TypeScript (fábrica de `THREE.Group`), priorizando fidelidade visual, silhueta precisa, materiais PBR extraídos dos pixels da imagem, hierarquia de ação (`pivots`, `sockets` e `userData.tick`), sem dependência de meshes ou fotogrametria baixadas.

---

## 📜 Princípios e Regras de Fidelidade (img2threejs Standard)

1. **Fidelidade de Proporções e Silhueta**: Manter rigorosamente o *aspect ratio*, cantos arredondados, biséis (*bevels*), linhas de painel, fixadores e zonas de brilho/fosco em relação à imagem de referência.
2. **Derivação de Materiais via Pixel**: Derivar a classe de acabamento (ex: alumínio anodizado, plástico fosco, vidro com alta refração) e gradientes a partir dos pixels da imagem de referência. Identificar cores que necessitem de compensação de *tone-mapping*.
3. **Contrato de Runtime**:
   * Expor pontos de pivô (*pivots*) e âncoras (*sockets*) para partes móveis ou interativas.
   * Incluir um handler `userData.tick` para animações contínuas/ociosas (*idle animations*).
4. **Honestidade sobre Limites**:
   * Declarar explicitamente partes não visíveis e suposições tomadas (ex: espelhamento de faces).
   * Relatar a confiança por região. Não declarar uma característica como "concluída" enquanto houver discrepâncias visuais.

---

## 🔄 O Pipeline de Escultura em Estágios (Sculpting Pipeline)

O ciclo de construção procedural segue estritamente os seguintes passos controlados por portas de qualidade (*Quality Gates*):

```
Intake & Analysis → Spec Assessment → Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
```

### Estágio 1: Intake & Análise Detalhada de Imagem
* Inventário de detalhes definidores de identidade (chanfros, costuras de painel, pinholes de câmera, textura de superfície, wear).
* Mapeamento da paleta PBR (`roughness`, `metalness`, `clearcoat`, `transmission`, `emissive`).

### Estágio 2: Avaliação da Especificação (Sculpt Spec)
* Definição da hierarquia de sub-grupos no `THREE.Group`.
* Mapeamento de âncoras (`sockets`), luzes da cena e alinhamento de coordenadas.
* Ativação da validação `--strict-quality`.

### Estágio 3: Construção Estagiada do Código (Pass-by-Pass)
1. **Blockout**: Proporções e silhueta macro usando malhas primitivas simples.
2. **Structural**: Montagem da hierarquia de sub-grupos, pivôs corretos e transformações espaciais.
3. **Form**: Refinamento de geometrias (chanfros com `ExtrudeGeometry`, cortes de pinhole, bordas arredondadas).
4. **Material**: Aplicação de `THREE.MeshStandardMaterial` / `THREE.MeshPhysicalMaterial` e texturas procedurais via `HTMLCanvasElement`.
5. **Surface**: Padrões gráficos, rugosidades locais, gradientes e texturas de superfície.
6. **Lighting**: Iluminação de estúdio (HDR/ToneMapping, luzes direcionais e sombras suaves `castShadow`/`receiveShadow`).
7. **Interaction**: Raycasting, pontos de clique, hover effects, âncoras para animação e `userData.tick`.
8. **Optimization**: `THREE.InstancedMesh` para repetições, otimização de vértices e descarte limpo de memória (`dispose`).

---

## 🏗️ Padrão de Fábrica TypeScript (Output Standard)

Todo modelo 3D procedural deve ser exportado no formato de fábrica tipada:

```typescript
import * as THREE from 'three';

export interface ModelOptions {
  colorScheme?: Record<string, string>;
  interactive?: boolean;
  scale?: number;
}

export interface ProceduralModelResult {
  group: THREE.Group;
  tick?: (delta: number) => void;
  dispose: () => void;
}

export function createProceduralModel(options: ModelOptions = {}): ProceduralModelResult {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ProceduralModelRoot';

  // 1. Materiais PBR Reutilizáveis
  // 2. Geometrias e Instâncias
  // 3. Montagem da Hierarquia & Sockets
  // 4. Handler de Animação (userData.tick)

  return {
    group: rootGroup,
    tick: (delta: number) => {
      // Animação ociosa ou efeitos procedurais
    },
    dispose: () => {
      // Limpeza de geometrias, materiais e texturas
    }
  };
}
```