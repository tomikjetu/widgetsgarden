import { useEffect, useRef, useState } from "react";

export function DropdownMenu({ children, options, onToggle }) {
  const [active, setAcitve] = useState(false);
  const dropdownRef = useRef(null);

  function ToggleActive(event) {
    event.preventDefault();
    setAcitve(!active);
    if(onToggle) onToggle();
    if (!options.length) setAcitve(false);
  }

  useEffect(() => {
    document.addEventListener("click", (event) => {
      if (!dropdownRef.current || !dropdownRef.current.contains(event.target)) setAcitve(false);
    })
  }, [])

  return <div ref={dropdownRef} className="dropdown-component">
    <div onClick={ToggleActive} className="dropdown-toggler">
      {children}
    </div>
    <ul className={`dropdown-menu ${active ? "dropdown-menu-active" : ""}`}>
      {options ? options.map((option, i) => {
        switch (option.type) {
          case "text": return <li key={i} className="dropdown-menu-item dropdown-menu-text"><p>{option.text}</p></li>
          case "link": return <li key={i} onClick={option.onClick} className="dropdown-menu-item dropdown-menu-link"><p>{option.text}</p></li>
          case "separator": return <li key={i} className="dropdown-menu-separator"></li>
        }
      }) : ""}
    </ul>
  </div>
}

      {/* <DropdownMenu
      options={[
        {
          type: "text",
          text: "My Account"
        },
        { type: "separator" },
        {
          type: "link",
          text: "My Profile",
          href: "/dashboard/profile"
        },
        {
          type: "link",
          text: "Settings",
          href: "/dashboard/settings"
        },
        {
          type: "link",
          text: "Logout",
          href: "/logout"
        }
      ]}>
      <a className="sidebar-item" href="#">
        <img src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg" className="rounded-circle dropdown-click"
          height="22" alt="" loading="lazy" />
        <p>{profile.username}</p>
      </a>
    </DropdownMenu> */}