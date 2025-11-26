import { themeTokens } from "@aibos/ui/design/tokens";
import { DarkModeToggle } from "./components/DarkModeToggle";

// Enterprise modules data (SAP/Oracle/Workday inspired)
const modules = [
  {
    icon: "📊",
    title: "Financial Management",
    desc: "General ledger, AP/AR, fixed assets, and real-time financial reporting with AI-powered forecasting.",
    tag: "Core",
  },
  {
    icon: "👥",
    title: "Human Capital",
    desc: "End-to-end workforce management from recruitment to retirement with predictive analytics.",
    tag: "Core",
  },
  {
    icon: "🏭",
    title: "Supply Chain",
    desc: "Procurement, inventory, logistics, and supplier management with demand sensing.",
    tag: "Operations",
  },
  {
    icon: "🛒",
    title: "Retail & POS",
    desc: "Omnichannel commerce, point-of-sale, and customer experience management.",
    tag: "Industry",
  },
  {
    icon: "🌱",
    title: "Plantation & Agriculture",
    desc: "Crop management, yield optimization, and sustainability tracking.",
    tag: "Industry",
  },
  {
    icon: "�icing",
    title: "Manufacturing",
    desc: "Production planning, quality control, and shop floor execution.",
    tag: "Operations",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50+", label: "Modules" },
  { value: "10K+", label: "Users Supported" },
  { value: "<200ms", label: "Response Time" },
];

const testimonials = [
  {
    quote:
      "AI-BOS transformed our operations with real-time insights we never had before.",
    author: "CFO",
    company: "Enterprise Client",
  },
  {
    quote:
      "The unified platform eliminated our data silos and reduced IT costs by 40%.",
    author: "CIO",
    company: "Manufacturing Corp",
  },
];

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: themeTokens.bg,
        color: themeTokens.fg,
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: `color-mix(in srgb, ${themeTokens.bgElevated} 95%, transparent)`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${themeTokens.borderSubtle}`,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `${themeTokens.spacingSm} ${themeTokens.spacingXl}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: themeTokens.spacingSm,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: themeTokens.primary,
                borderRadius: themeTokens.radiusMd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: themeTokens.primaryForeground,
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              AI
            </div>
            <span style={{ fontWeight: 600, fontSize: themeTokens.fontLg }}>
              AI-BOS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: themeTokens.spacingXl,
            }}
          >
            <a
              href="#modules"
              style={{
                color: themeTokens.fgMuted,
                textDecoration: "none",
                fontSize: themeTokens.fontSm,
              }}
            >
              Modules
            </a>
            <a
              href="#platform"
              style={{
                color: themeTokens.fgMuted,
                textDecoration: "none",
                fontSize: themeTokens.fontSm,
              }}
            >
              Platform
            </a>
            <a
              href="#enterprise"
              style={{
                color: themeTokens.fgMuted,
                textDecoration: "none",
                fontSize: themeTokens.fontSm,
              }}
            >
              Enterprise
            </a>
            <DarkModeToggle />
            <a
              href="/auth/login"
              style={{
                backgroundColor: themeTokens.primary,
                color: themeTokens.primaryForeground,
                padding: `${themeTokens.spacingSm} ${themeTokens.spacingMd}`,
                borderRadius: themeTokens.radiusMd,
                fontSize: themeTokens.fontSm,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - SAP/Workday inspired gradient hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${themeTokens.bg} 0%, ${themeTokens.bgMuted} 50%, ${themeTokens.primarySoft} 100%)`,
          paddingBlock: themeTokens.spacing6xl,
        }}
      >
        {/* Decorative grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${themeTokens.border} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: themeTokens.spacing2xl,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: themeTokens.spacingXs,
                backgroundColor: themeTokens.successSoft,
                color: themeTokens.success,
                padding: `${themeTokens.spacingXs} ${themeTokens.spacingSm}`,
                borderRadius: themeTokens.radiusFull,
                fontSize: themeTokens.fontXs,
                fontWeight: 600,
                marginBottom: themeTokens.spacingMd,
                textTransform: "uppercase",
                letterSpacing: themeTokens.trackingWide,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: themeTokens.success,
                  borderRadius: "50%",
                }}
              />
              Enterprise Ready
            </div>
            <h1
              style={{
                fontSize: themeTokens.fontDisplayLg,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: themeTokens.spacingLg,
                letterSpacing: themeTokens.trackingTight,
              }}
            >
              Intelligent ERP for the
              <span style={{ color: themeTokens.primary }}>
                {" "}
                Modern Enterprise
              </span>
            </h1>
            <p
              style={{
                fontSize: themeTokens.fontLg,
                color: themeTokens.fgMuted,
                lineHeight: themeTokens.lineHeightRelaxed,
                marginBottom: themeTokens.spacingXl,
                maxWidth: "520px",
              }}
            >
              Unify finance, HR, supply chain, and operations on a single
              AI-powered platform. Built for scale, designed for simplicity.
            </p>
            <div style={{ display: "flex", gap: themeTokens.spacingMd }}>
              <a
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: themeTokens.spacingXs,
                  backgroundColor: themeTokens.primary,
                  color: themeTokens.primaryForeground,
                  padding: `${themeTokens.spacingMd} ${themeTokens.spacingXl}`,
                  borderRadius: themeTokens.radiusLg,
                  fontSize: themeTokens.fontBase,
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: themeTokens.shadowMd,
                }}
              >
                Start Free Trial
                <span>→</span>
              </a>
              <a
                href="#demo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: themeTokens.spacingXs,
                  backgroundColor: themeTokens.bgElevated,
                  color: themeTokens.fg,
                  padding: `${themeTokens.spacingMd} ${themeTokens.spacingXl}`,
                  borderRadius: themeTokens.radiusLg,
                  fontSize: themeTokens.fontBase,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: `1px solid ${themeTokens.border}`,
                }}
              >
                <span>▶</span>
                Watch Demo
              </a>
            </div>
          </div>
          {/* Hero Visual - Dashboard Preview */}
          <div
            style={{
              position: "relative",
              backgroundColor: themeTokens.bgElevated,
              borderRadius: themeTokens.radiusXl,
              border: `1px solid ${themeTokens.border}`,
              boxShadow: themeTokens.shadowLg,
              padding: themeTokens.spacingMd,
              transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
            }}
          >
            {/* Mock Dashboard Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: themeTokens.spacingXs,
                marginBottom: themeTokens.spacingSm,
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: themeTokens.danger,
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: themeTokens.warning,
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: themeTokens.success,
                }}
              />
            </div>
            {/* Mock Dashboard Content */}
            <div
              style={{
                backgroundColor: themeTokens.bg,
                borderRadius: themeTokens.radiusMd,
                padding: themeTokens.spacingLg,
                minHeight: "320px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: themeTokens.spacingMd,
                  marginBottom: themeTokens.spacingLg,
                }}
              >
                {["Revenue", "Orders", "Users"].map((label) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      backgroundColor: themeTokens.bgMuted,
                      borderRadius: themeTokens.radiusMd,
                      padding: themeTokens.spacingMd,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: themeTokens.fgSubtle,
                        marginBottom: "4px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{ fontSize: themeTokens.fontH4, fontWeight: 700 }}
                    >
                      {label === "Revenue"
                        ? "$2.4M"
                        : label === "Orders"
                          ? "12,847"
                          : "3,291"}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mock Chart */}
              <div
                style={{
                  height: "140px",
                  background: `linear-gradient(180deg, ${themeTokens.primarySoft} 0%, transparent 100%)`,
                  borderRadius: themeTokens.radiusMd,
                  display: "flex",
                  alignItems: "flex-end",
                  padding: themeTokens.spacingSm,
                  gap: "8px",
                }}
              >
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        backgroundColor: themeTokens.primary,
                        borderRadius: "4px 4px 0 0",
                        opacity: 0.8 + i * 0.015,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Oracle inspired */}
      <section
        style={{
          backgroundColor: themeTokens.fg,
          color: themeTokens.bg,
          padding: `${themeTokens.spacingXl} 0`,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: themeTokens.spacingXl,
            textAlign: "center",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: themeTokens.fontDisplaySm,
                  fontWeight: 700,
                  marginBottom: themeTokens.spacingXs,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: themeTokens.fontSm, opacity: 0.7 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section - SAP inspired grid */}
      <section
        id="modules"
        style={{
          padding: `${themeTokens.spacing5xl} 0`,
          backgroundColor: themeTokens.bg,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: themeTokens.spacing2xl,
            }}
          >
            <div
              style={{
                fontSize: themeTokens.fontXs,
                fontWeight: 600,
                color: themeTokens.primary,
                textTransform: "uppercase",
                letterSpacing: themeTokens.trackingWider,
                marginBottom: themeTokens.spacingSm,
              }}
            >
              Comprehensive Suite
            </div>
            <h2
              style={{
                fontSize: themeTokens.fontDisplaySm,
                fontWeight: 700,
                marginBottom: themeTokens.spacingMd,
                letterSpacing: themeTokens.trackingTight,
              }}
            >
              Enterprise Modules
            </h2>
            <p
              style={{
                fontSize: themeTokens.fontLg,
                color: themeTokens.fgMuted,
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Integrated applications designed to work seamlessly together,
              eliminating data silos and streamlining operations.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: themeTokens.spacingLg,
            }}
          >
            {modules.map((module) => (
              <div
                key={module.title}
                style={{
                  backgroundColor: themeTokens.bgElevated,
                  border: `1px solid ${themeTokens.border}`,
                  borderRadius: themeTokens.radiusLg,
                  padding: themeTokens.spacingXl,
                  transition: "all 150ms ease",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: themeTokens.spacingMd,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: themeTokens.primarySoft,
                      borderRadius: themeTokens.radiusMd,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    {module.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color:
                        module.tag === "Core"
                          ? themeTokens.primary
                          : themeTokens.fgMuted,
                      backgroundColor:
                        module.tag === "Core"
                          ? themeTokens.primarySoft
                          : themeTokens.bgMuted,
                      padding: `${themeTokens.spacingXs} ${themeTokens.spacingSm}`,
                      borderRadius: themeTokens.radiusFull,
                      textTransform: "uppercase",
                      letterSpacing: themeTokens.trackingWide,
                    }}
                  >
                    {module.tag}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: themeTokens.fontLg,
                    fontWeight: 600,
                    marginBottom: themeTokens.spacingSm,
                  }}
                >
                  {module.title}
                </h3>
                <p
                  style={{
                    fontSize: themeTokens.fontSm,
                    color: themeTokens.fgMuted,
                    lineHeight: themeTokens.lineHeightRelaxed,
                  }}
                >
                  {module.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features - Workday inspired */}
      <section
        id="platform"
        style={{
          padding: `${themeTokens.spacing5xl} 0`,
          backgroundColor: themeTokens.bgMuted,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: themeTokens.spacing4xl,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: themeTokens.fontXs,
                fontWeight: 600,
                color: themeTokens.primary,
                textTransform: "uppercase",
                letterSpacing: themeTokens.trackingWider,
                marginBottom: themeTokens.spacingSm,
              }}
            >
              Built Different
            </div>
            <h2
              style={{
                fontSize: themeTokens.fontDisplaySm,
                fontWeight: 700,
                marginBottom: themeTokens.spacingLg,
                letterSpacing: themeTokens.trackingTight,
              }}
            >
              AI-Native Architecture
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: themeTokens.spacingLg,
              }}
            >
              {[
                {
                  title: "Predictive Intelligence",
                  desc: "ML models trained on your data for accurate forecasting",
                },
                {
                  title: "Real-Time Analytics",
                  desc: "Sub-second query performance on billions of records",
                },
                {
                  title: "Adaptive Workflows",
                  desc: "Self-optimizing processes that learn from usage patterns",
                },
                {
                  title: "Natural Language",
                  desc: "Query your data and trigger actions with plain English",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  style={{ display: "flex", gap: themeTokens.spacingMd }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: themeTokens.success,
                      borderRadius: themeTokens.radiusFull,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: themeTokens.successForeground,
                      fontSize: "14px",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: themeTokens.fontBase,
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      style={{
                        fontSize: themeTokens.fontSm,
                        color: themeTokens.fgMuted,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Feature Visual */}
          <div
            style={{
              backgroundColor: themeTokens.bgElevated,
              borderRadius: themeTokens.radiusXl,
              border: `1px solid ${themeTokens.border}`,
              padding: themeTokens.spacingXl,
              boxShadow: themeTokens.shadowLg,
            }}
          >
            <div
              style={{
                fontSize: themeTokens.fontSm,
                color: themeTokens.fgMuted,
                marginBottom: themeTokens.spacingMd,
              }}
            >
              AI Assistant
            </div>
            <div
              style={{
                backgroundColor: themeTokens.bg,
                borderRadius: themeTokens.radiusMd,
                padding: themeTokens.spacingMd,
                marginBottom: themeTokens.spacingMd,
              }}
            >
              <div
                style={{
                  fontSize: themeTokens.fontSm,
                  color: themeTokens.fgMuted,
                  marginBottom: themeTokens.spacingSm,
                }}
              >
                You asked:
              </div>
              <div style={{ fontSize: themeTokens.fontBase }}>
                "Show me revenue trends for Q4 with YoY comparison"
              </div>
            </div>
            <div
              style={{
                backgroundColor: themeTokens.primarySoft,
                borderRadius: themeTokens.radiusMd,
                padding: themeTokens.spacingMd,
                borderLeft: `3px solid ${themeTokens.primary}`,
              }}
            >
              <div
                style={{
                  fontSize: themeTokens.fontSm,
                  color: themeTokens.primary,
                  marginBottom: themeTokens.spacingSm,
                  fontWeight: 600,
                }}
              >
                AI Response:
              </div>
              <div
                style={{
                  fontSize: themeTokens.fontSm,
                  lineHeight: themeTokens.lineHeightRelaxed,
                }}
              >
                Q4 revenue is up 23% YoY at $2.4M. Key drivers: Retail (+31%),
                Manufacturing (+18%). Recommend focusing on supply chain
                optimization for Q1.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          padding: `${themeTokens.spacing5xl} 0`,
          backgroundColor: themeTokens.bg,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2
              style={{
                fontSize: themeTokens.fontDisplaySm,
                fontWeight: 700,
                letterSpacing: themeTokens.trackingTight,
              }}
            >
              Trusted by Enterprise Leaders
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: themeTokens.spacingXl,
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: themeTokens.bgElevated,
                  border: `1px solid ${themeTokens.border}`,
                  borderRadius: themeTokens.radiusLg,
                  padding: themeTokens.spacingXl,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    color: themeTokens.primary,
                    marginBottom: themeTokens.spacingMd,
                  }}
                >
                  "
                </div>
                <p
                  style={{
                    fontSize: themeTokens.fontLg,
                    lineHeight: themeTokens.lineHeightRelaxed,
                    marginBottom: themeTokens.spacingLg,
                  }}
                >
                  {t.quote}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: themeTokens.spacingMd,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: themeTokens.bgMuted,
                      borderRadius: themeTokens.radiusFull,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: themeTokens.fontLg,
                      fontWeight: 600,
                      color: themeTokens.fgMuted,
                    }}
                  >
                    {t.author[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.author}</div>
                    <div
                      style={{
                        fontSize: themeTokens.fontSm,
                        color: themeTokens.fgMuted,
                      }}
                    >
                      {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: `${themeTokens.spacing5xl} 0`,
          background: `linear-gradient(135deg, ${themeTokens.primary} 0%, ${themeTokens.secondary} 100%)`,
          color: themeTokens.primaryForeground,
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
          }}
        >
          <h2
            style={{
              fontSize: themeTokens.fontDisplaySm,
              fontWeight: 700,
              marginBottom: themeTokens.spacingMd,
            }}
          >
            Ready to Transform Your Enterprise?
          </h2>
          <p
            style={{
              fontSize: themeTokens.fontLg,
              opacity: 0.9,
              marginBottom: themeTokens.spacingXl,
            }}
          >
            Join leading organizations already running on AI-BOS
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: themeTokens.spacingMd,
            }}
          >
            <a
              href="/dashboard"
              style={{
                backgroundColor: themeTokens.primaryForeground,
                color: themeTokens.primary,
                padding: `${themeTokens.spacingMd} ${themeTokens.spacingXl}`,
                borderRadius: themeTokens.radiusLg,
                fontSize: themeTokens.fontBase,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get Started Free
            </a>
            <a
              href="#contact"
              style={{
                backgroundColor: "transparent",
                color: themeTokens.primaryForeground,
                padding: `${themeTokens.spacingMd} ${themeTokens.spacingXl}`,
                borderRadius: themeTokens.radiusLg,
                fontSize: themeTokens.fontBase,
                fontWeight: 600,
                textDecoration: "none",
                border: `2px solid ${themeTokens.primaryForeground}`,
              }}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: themeTokens.fg,
          color: themeTokens.bg,
          padding: `${themeTokens.spacingXl} 0`,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: `0 ${themeTokens.spacingXl}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: themeTokens.spacingSm,
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: themeTokens.primary,
                borderRadius: themeTokens.radiusSm,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: themeTokens.primaryForeground,
                fontWeight: 700,
                fontSize: "10px",
              }}
            >
              AI
            </div>
            <span style={{ fontWeight: 600 }}>AI-BOS Platform</span>
          </div>
          <div style={{ fontSize: themeTokens.fontSm, opacity: 0.7 }}>
            © 2025 AI-BOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
