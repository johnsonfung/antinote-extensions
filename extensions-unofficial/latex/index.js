(function() {
  const extensionName = "latex";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.2",
    endpoints: [],
    requiredAPIKeys: [],
    author: "user",
    category: "Formatting",
    dataScope: "full"
  });

  const superscripts = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
    'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ',
    'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ', 'U': 'ᵁ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ'
  };

  const subscripts = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
    'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
  };

  const unicodeMap = {
    // Logic & Set Theory
    "forall": "∀",
    "exists": "∃",
    "land": "∧",
    "lor": "∨",
    "neg": "¬",
    "cap": "∩",
    "cup": "∪",
    "bigcap": "⋂",
    "bigcup": "⋃",
    "bigwedge": "⋀",
    "bigvee": "⋁",
    "in": "∈",
    "notin": "∉",
    "ni": "∋",
    "empty": "∅",
    "emptyset": "∅",
    "subset": "⊂",
    "supset": "⊃",
    "subseteq": "⊆",
    "supseteq": "⊇",
    "impl": "⇒",
    "implies": "⇒",
    "iff": "⇔",
    "to": "→",
    "gets": "←",
    "rightarrow": "→",
    "leftarrow": "←",
    "leftrightarrow": "↔",
    "Rightarrow": "⇒",
    "Leftarrow": "⇐",
    "Leftrightarrow": "⇔",

    // Operators & Relations
    "sum": "∑",
    "prod": "∏",
    "coprod": "∐",
    "int": "∫",
    "iint": "∬",
    "iiint": "∭",
    "oint": "∮",
    "partial": "∂",
    "nabla": "∇",
    "infty": "∞",
    "approx": "≈",
    "equiv": "≡",
    "cong": "≅",
    "sim": "∼",
    "ne": "≠",
    "neq": "≠",
    "le": "≤",
    "leq": "≤",
    "ge": "≥",
    "geq": "≥",
    "pm": "±",
    "mp": "∓",
    "times": "×",
    "div": "÷",
    "propto": "∝",
    "cdot": "·",
    "bullet": "•",
    "circ": "◦",
    "ast": "∗",

    // Greek Letters (Lowercase)
    "alpha": "α",
    "beta": "β",
    "gamma": "γ",
    "delta": "δ",
    "epsilon": "ε",
    "zeta": "ζ",
    "eta": "η",
    "theta": "θ",
    "iota": "ι",
    "kappa": "κ",
    "lambda": "λ",
    "mu": "μ",
    "nu": "ν",
    "xi": "ξ",
    "pi": "π",
    "rho": "ρ",
    "sigma": "σ",
    "tau": "τ",
    "upsilon": "υ",
    "phi": "φ",
    "chi": "χ",
    "psi": "ψ",
    "omega": "ω",

    // Greek Letters (Uppercase)
    "Gamma": "Γ",
    "Delta": "Δ",
    "Theta": "Θ",
    "Lambda": "Λ",
    "Xi": "Ξ",
    "Pi": "Π",
    "Sigma": "Σ",
    "Phi": "Φ",
    "Psi": "Ψ",
    "Omega": "Ω"
  };

  function convertSuperscript(str) {
    return str.split('').map(c => superscripts[c] || c).join('');
  }

  function convertSubscript(str) {
    return str.split('').map(c => subscripts[c] || c).join('');
  }

  const sortedKeys = Object.keys(unicodeMap).sort((a, b) => b.length - a.length);
  const keywordRegex = new RegExp("\\\\(" + sortedKeys.join("|") + ")\\b", "g");

  function parseLatex(text) {
    if (!text) return "";

    let result = text;

    // 0. Replace summation/product limits with parentheses ranges
    const operators = {
      "sum": "∑",
      "prod": "∏",
      "coprod": "∐",
      "bigcap": "⋂",
      "bigcup": "⋃",
      "bigwedge": "⋀",
      "bigvee": "⋁"
    };

    const opKeys = Object.keys(operators).join("|");
    const subSupBraces = new RegExp("\\\\(" + opKeys + ")_\\{([^{}]+)\\}\\^\\{([^{}]+)\\}", "g");
    const supSubBraces = new RegExp("\\\\(" + opKeys + ")\\^\\{([^{}]+)\\}_\\{([^{}]+)\\}", "g");
    const subBraces = new RegExp("\\\\(" + opKeys + ")_\\{([^{}]+)\\}", "g");
    const supBraces = new RegExp("\\\\(" + opKeys + ")\\^\\{([^{}]+)\\}", "g");

    const subSupSingle = new RegExp("\\\\(" + opKeys + ")_([0-9a-zA-Z])\\^([0-9a-zA-Z])", "g");
    const supSubSingle = new RegExp("\\\\(" + opKeys + ")\\^([0-9a-zA-Z])_([0-9a-zA-Z])", "g");
    const subSingle = new RegExp("\\\\(" + opKeys + ")_([0-9a-zA-Z])", "g");
    const supSingle = new RegExp("\\\\(" + opKeys + ")\\^([0-9a-zA-Z])", "g");

    // Replace both limits (braced)
    result = result.replace(subSupBraces, function(match, op, sub, sup) {
      return operators[op] + "(" + parseLatex(sub) + " → " + parseLatex(sup) + ")";
    });
    result = result.replace(supSubBraces, function(match, op, sup, sub) {
      return operators[op] + "(" + parseLatex(sub) + " → " + parseLatex(sup) + ")";
    });

    // Replace both limits (single character)
    result = result.replace(subSupSingle, function(match, op, sub, sup) {
      return operators[op] + "(" + parseLatex(sub) + " → " + parseLatex(sup) + ")";
    });
    result = result.replace(supSubSingle, function(match, op, sup, sub) {
      return operators[op] + "(" + parseLatex(sub) + " → " + parseLatex(sup) + ")";
    });

    // Replace single limits (braced)
    result = result.replace(subBraces, function(match, op, sub) {
      return operators[op] + "(" + parseLatex(sub) + ")";
    });
    result = result.replace(supBraces, function(match, op, sup) {
      return operators[op] + "(→ " + parseLatex(sup) + ")";
    });

    // Replace single limits (single character)
    result = result.replace(subSingle, function(match, op, sub) {
      return operators[op] + "(" + parseLatex(sub) + ")";
    });
    result = result.replace(supSingle, function(match, op, sup) {
      return operators[op] + "(→ " + parseLatex(sup) + ")";
    });

    // 1. Replace keywords
    result = result.replace(keywordRegex, function(match, key) {
      return unicodeMap[key] || match;
    });

    // 2. Replace fractions: \frac{a}{b} -> (a)/(b)
    let fractionRegex = /\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g;
    while (fractionRegex.test(result)) {
      result = result.replace(fractionRegex, "($1)/($2)");
    }

    // 3. Replace square roots: \sqrt{a} -> √a or √(a)
    let sqrtRegex = /\\sqrt\s*\{([^{}]+)\}/g;
    while (sqrtRegex.test(result)) {
      result = result.replace(sqrtRegex, "√($1)");
    }
    result = result.replace(/\\sqrt\s*([0-9a-zA-Z\(\)])/g, "√$1");

    // 4. Replace superscripts: x^{abc} -> xᵃᵇᶜ or x^2 -> x²
    result = result.replace(/\^\{([^{}]+)\}/g, function(match, content) {
      return convertSuperscript(content);
    });
    result = result.replace(/\^([0-9a-zA-Z+-=()])/g, function(match, content) {
      return convertSuperscript(content);
    });

    // 5. Replace subscripts: x_{abc} -> xₐ♭꜀ or x_2 -> x₂
    result = result.replace(/_\{([^{}]+)\}/g, function(match, content) {
      return convertSubscript(content);
    });
    result = result.replace(/_([0-9a-zA-Z+-=()])/g, function(match, content) {
      return convertSubscript(content);
    });

    // 6. Clean up LaTeX formatting syntax
    result = result.replace(/\\(quad|qquad)/g, "  ");
    result = result.replace(/\\[,;!]/g, " ");
    result = result.replace(/\\(left|right)/g, "");

    return result;
  }

  // Command 1: latex
  const latex = new Command({
    name: "latex",
    parameters: [
      new Parameter({
        type: "string",
        name: "expression",
        helpText: "The math expression to format",
        required: true
      })
    ],
    type: "replaceLine",
    helpText: "Translate a LaTeX math expression into Unicode characters",
    tutorials: [
      new TutorialCommand({
        command: "latex(\\forall x \\exists \\delta)",
        description: "Translates to ∀ ∃ δ"
      })
    ],
    extension: extensionRoot
  });

  latex.execute = function(payload) {
    let expression = "";
    const fullText = payload.fullText || "";

    // Extract the raw expression with balanced parentheses counting
    const cmdIndex = fullText.indexOf("::latex(");
    if (cmdIndex !== -1) {
      let depth = 1;
      let i = cmdIndex + 8; // length of "::latex("
      while (i < fullText.length && depth > 0) {
        const char = fullText[i];
        if (char === '(') {
          depth++;
        } else if (char === ')') {
          depth--;
        }
        
        if (depth > 0) {
          expression += char;
        }
        i++;
      }
    }

    // Fallback if not found in fullText or parsing failed
    if (!expression) {
      const [parsedParam] = this.getParsedParams(payload);
      expression = parsedParam || "";
    }

    if (!expression) {
      return new ReturnObject({
        status: "error",
        message: "Please provide a math expression."
      });
    }

    const parsed = parseLatex(expression);

    return new ReturnObject({
      status: "success",
      message: "Successfully formatted math expression.",
      payload: parsed
    });
  };

  // Command 2: latex_note
  const latex_note = new Command({
    name: "latex_note",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert all LaTeX expressions in the note to Unicode math",
    tutorials: [
      new TutorialCommand({
        command: "latex_note",
        description: "Formats LaTeX math in the entire note"
      })
    ],
    extension: extensionRoot
  });

  latex_note.execute = function(payload) {
    const fullText = payload.fullText || "";

    const hasDoubleDollar = fullText.includes("$$");
    const hasSingleDollar = /\$([^$\n]+)\$/.test(fullText);
    const bracketRegex = /\[((?:[^\[\]]|\[[^\[\]]*\])*)\]/g;
    const hasBrackets = bracketRegex.test(fullText);
    bracketRegex.lastIndex = 0; // Reset regex index

    let result = fullText;

    if (hasDoubleDollar || hasSingleDollar || hasBrackets) {
      if (hasDoubleDollar) {
        result = result.replace(/\$\$([\s\S]*?)\$\$/g, function(match, content) {
          return parseLatex(content);
        });
      }
      if (hasSingleDollar) {
        result = result.replace(/\$([^$\n]+)\$/g, function(match, content) {
          return parseLatex(content);
        });
      }
      if (hasBrackets) {
        result = result.replace(bracketRegex, function(match, content) {
          return parseLatex(content);
        });
      }
    } else {
      result = parseLatex(fullText);
    }

    return new ReturnObject({
      status: "success",
      message: "Applied LaTeX formatting.",
      payload: result
    });
  };
})();
