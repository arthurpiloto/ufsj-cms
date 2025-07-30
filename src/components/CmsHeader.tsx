import React from "react";

interface CmsHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function CmsHeader({
  title,
  subtitle,
  children,
}: CmsHeaderProps) {
  return (
    <header className="br-header large" data-sticky="data-sticky">
      <div className="container-fluid">
        <div className="header-bottom d-flex align-items-center">
          <div className="header-menu">
            <div className="header-info">
              <span className="header-title">{title}</span>
              <div className="header-subtitle">{subtitle}</div>
            </div>
          </div>
          <div className="logos-container d-flex ml-auto">
            {children}
            <img
              className="m-0 ml-4"
              width="90"
              src="/logo_proen.png"
              alt="Logo PROEN"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/90x40/ffffff/000000?text=Logo+PROEN")
              }
            />
            <img
              className="m-0"
              width="110"
              src="/logo_ufsj.png"
              alt="Logo UFSJ"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/110x40/ffffff/000000?text=Logo+UFSJ")
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
