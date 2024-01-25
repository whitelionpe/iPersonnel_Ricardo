import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import objectPath from "object-path";
import KTToggle from "../../_assets/js/toggle";
import { toAbsoluteUrl } from "../..";

class HeaderMobile extends React.Component {
    toggleButtonRef = React.createRef();

    componentDidMount() {
        new KTToggle(this.toggleButtonRef.current, this.props.toggleOptions);
    }

    render() {
        const { asideDisplay, htmlClassService, perfil } = this.props;
        const headerMobileCssClasses = htmlClassService.classes.header_mobile.join(" ");
        const style = { color: "#fbfbff", marginLeft: '12px' };

        return (
            <div id="kt_header_mobile" className={`kt-header-mobile ${headerMobileCssClasses}`}>
                <div className="kt-header-mobile__logo">
                    <Link to="/">
                        <img alt="logo movil responsive"  style={{ height: '60px' }} src={toAbsoluteUrl("/media/iconsappv02/2personnel_login.png")} />
                    </Link>
                    <div style={style}>
                        <span>{`${perfil.Cliente}`}</span>
                    </div>
                </div>

                <div className="kt-header-mobile__toolbar">
                    {asideDisplay && (
                        <button
                            className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left"
                            id="kt_aside_mobile_toggler"
                        >
                            <span />
                        </button>
                    )}
                    <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler">
                        <span />
                    </button>
                    <button
                        ref={this.toggleButtonRef}
                        className="kt-header-mobile__toolbar-topbar-toggler"
                        id="kt_header_mobile_topbar_toggler"
                    >
                        <i className="flaticon2-gear" />
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = store => {
    return {
        asideDisplay: objectPath.get(store.builder.configs, "aside.self.display"),
        toggleOptions: {
            target: "body",
            targetState: "kt-header__topbar--mobile-on",
            togglerState: "kt-header-mobile__toolbar-topbar-toggler--active"
        },
        //perfil: auth.perfil
        perfil: store.perfil.perfilActual
    };
};

export default connect(mapStateToProps)(HeaderMobile);
