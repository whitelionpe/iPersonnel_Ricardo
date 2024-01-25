import React from "react";
import clsx from "clsx";
import { connect } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { metronic, toAbsoluteUrl } from "../../../_metronic";
import HeaderDropdownToggle from "../content/CustomDropdowns/HeaderDropdownToggle";
import Constants from "../../store/config/Constants";

const languages = [
  {
    lang: "en",
    name: "English",
    flag: toAbsoluteUrl("/media/flags/260-united-kingdom.svg")
  },
  /* {
     lang: "zh",
     name: "Mandarin",
     flag: toAbsoluteUrl("/media/flags/034-china.svg")
   },*/
  {
    lang: "es",
    name: "Spanish",
    flag: toAbsoluteUrl("/media/flags/" + Constants.FLAG_SPANISH)
  },
  /*{
    lang: "ja",
    name: "Japanese",
    flag: toAbsoluteUrl("/media/flags/063-japan.svg")
  },
  {
    lang: "de",
    name: "German",
    flag: toAbsoluteUrl("/media/flags/162-germany.svg")
  },
  {
    lang: "fr",
    name: "French",
    flag: toAbsoluteUrl("/media/flags/195-france.svg")
  }*/
];

class LanguageSelector extends React.Component {
  render() {
    const { lang, iconType, setLanguage } = this.props;
    const currentLanguage = languages.find(x => x.lang === lang);
    return (
      <Dropdown
        className="kt-header__topbar-item kt-header__topbar-item--langs"
        drop="down" alignRight
      >
        <Dropdown.Toggle as={HeaderDropdownToggle} id="dropdown-toggle-my-cart">
          <span>
            {/* <img src={currentLanguage.flag} alt={currentLanguage.name} /> */}

            <div className="clsMenuIdioma" id="menu-drop" >
              <span className="select" style={{ textTransform: "uppercase" }}>{currentLanguage.lang}</span>
              <div className="clsMenuIdiomaBox">
                <div className="clsMenuIdiomaIcon"></div>
              </div>
            </div>

          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround">
          <ul className="kt-nav">
            {languages.map(language => {
              if (language.lang !== currentLanguage.lang) {

                return (
                  <li
                    key={language.lang}
                    className={clsx("kt-nav__item")}
                  >
                    <span
                      onClick={() => {
                        setLanguage(language.lang);
                        this.setState({ open: false });
                        setTimeout(() => window.location.reload(), 400);
                      }}
                      className={clsx("kt-nav__link", {
                        "kt-nav__link--active":
                          language.lang === currentLanguage.lang
                      })}
                    >
                      <span className="kt-nav__link-text">{language.lang}</span>
                    </span>
                  </li>
                )
              }

            })}
          </ul>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const mapStateToProps = ({ i18n }) => ({ lang: i18n.lang });

export default connect(
  mapStateToProps,
  metronic.i18n.actions
)(LanguageSelector);
