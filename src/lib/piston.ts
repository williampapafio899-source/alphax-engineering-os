import type { ExecuteRequest, ExecuteResult, Runtime } from "@/types";

const PISTON_URL = process.env.PISTON_URL ?? "https://emkc.org";

// ─── Fetch available runtimes ─────────────────────────────────────────────────
export async function getRuntimes(): Promise<Runtime[]> {
  const res = await fetch(`${PISTON_URL}/api/v2/piston/runtimes`, {
    next: { revalidate: 300 }, // Cache 5 mins
  });
  if (!res.ok) throw new Error(`Piston runtimes error: ${res.status}`);
  return res.json();
}

// ─── Execute code ─────────────────────────────────────────────────────────────
export async function executeCode(req: ExecuteRequest): Promise<ExecuteResult> {
  const res = await fetch(`${PISTON_URL}/api/v2/piston/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: req.language,
      version: req.version,
      files: [{ name: getFileName(req.language), content: req.code }],
      stdin: req.stdin ?? "",
      args: req.args ?? [],
      run_timeout: 3000,       // Piston max is 3000ms
      compile_timeout: 10000,
      run_memory_limit: -1,    // no memory limit (avoids config limit errors)
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Piston execute error: ${err}`);
  }
  return res.json();
}

// ─── Language → filename mapping ─────────────────────────────────────────────
function getFileName(language: string): string {
  const map: Record<string, string> = {
    python:     "main.py",
    javascript: "main.js",
    typescript: "main.ts",
    c:          "main.c",
    cpp:        "main.cpp",
    java:       "Main.java",
    go:         "main.go",
    rust:       "main.rs",
    ruby:       "main.rb",
    bash:       "main.sh",
    kotlin:     "main.kt",
    swift:      "main.swift",
    php:        "main.php",
    csharp:     "main.cs",
    lua:        "main.lua",
    perl:       "main.pl",
    r:          "main.r",
    scala:      "main.scala",
  };
  return map[language.toLowerCase()] ?? `main.${language}`;
}

// ─── Languages the Engineering OS teaches ────────────────────────────────────
export const EOS_LANGUAGES = [
  { id: "python",     label: "Python",      version: "3.*",  icon: "🐍" },
  { id: "javascript", label: "JavaScript",  version: "18.*", icon: "📜" },
  { id: "typescript", label: "TypeScript",  version: "5.*",  icon: "🔷" },
  { id: "c",          label: "C",           version: "*",    icon: "⚙️"  },
  { id: "cpp",        label: "C++",         version: "*",    icon: "⚡"  },
  { id: "java",       label: "Java",        version: "*",    icon: "☕"  },
  { id: "go",         label: "Go",          version: "*",    icon: "🐹"  },
  { id: "rust",       label: "Rust",        version: "*",    icon: "🦀"  },
  { id: "bash",       label: "Bash",        version: "*",    icon: "💻"  },
  { id: "ruby",       label: "Ruby",        version: "*",    icon: "💎"  },
  { id: "kotlin",     label: "Kotlin",      version: "*",    icon: "🟣"  },
  { id: "swift",      label: "Swift",       version: "*",    icon: "🍎"  },
  { id: "php",        label: "PHP",         version: "*",    icon: "🐘"  },
  { id: "csharp",     label: "C#",          version: "*",    icon: "🎯"  },
  { id: "lua",        label: "Lua",         version: "*",    icon: "🌙"  },
  { id: "r",          label: "R",           version: "*",    icon: "📊"  },
  { id: "scala",      label: "Scala",       version: "*",    icon: "🔴"  },
];

// ─── Default starter code ─────────────────────────────────────────────────────
export const STARTER_CODE: Record<string, string> = {
  python: `# Engineering OS — Python Workspace
# Write your code here and press Run

def main():
    print("Hello, Engineer! 🚀")

    # Try something:
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    print(f"Sum of {numbers} = {total}")

main()
`,
  javascript: `// Engineering OS — JavaScript Workspace
// Write your code here and press Run

function main() {
  console.log("Hello, Engineer! 🚀");

  // Try something:
  const numbers = [1, 2, 3, 4, 5];
  const total = numbers.reduce((a, b) => a + b, 0);
  console.log(\`Sum of [\${numbers}] = \${total}\`);
}

main();
`,
  c: `// Engineering OS — C Workspace
#include <stdio.h>

int main() {
    printf("Hello, Engineer!\\n");

    // Try something:
    int numbers[] = {1, 2, 3, 4, 5};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    int total = 0;
    for (int i = 0; i < n; i++) total += numbers[i];
    printf("Sum = %d\\n", total);

    return 0;
}
`,
  typescript: `// Engineering OS — TypeScript Workspace
interface Result {
  numbers: number[];
  sum: number;
}

function calculate(numbers: number[]): Result {
  return {
    numbers,
    sum: numbers.reduce((a, b) => a + b, 0)
  };
}

const result = calculate([1, 2, 3, 4, 5]);
console.log("Hello, Engineer! 🚀");
console.log(\`Sum of [\${result.numbers}] = \${result.sum}\`);
`,
  bash: `#!/bin/bash
# Engineering OS — Bash Workspace
echo "Hello, Engineer! 🚀"

numbers=(1 2 3 4 5)
total=0
for n in "\${numbers[@]}"; do
  total=$((total + n))
done
echo "Sum = $total"
`,
};
