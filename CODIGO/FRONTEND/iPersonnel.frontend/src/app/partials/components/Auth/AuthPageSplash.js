import React, {Fragment, useState, useRef} from "react";
// import { Link, Switch, Route, Redirect } from "react-router-dom"; import {
// toAbsoluteUrl } from "../../../../_metronic";
import "./AuthPage.css";
// import ChangeForgottenPassword from
// "../../../pages/auth/ChangeForgottenPassword"; import queryString from
// 'query-string';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

import {makeStyles} from '@material-ui/core/styles';

//import LanguageSelector from '../../layout/LanguageSelector';
import {injectIntl} from "react-intl";
// import { loadImages } from "../../../crud/auth.crud";
import {WithLoandingPanel} from "../../content/withLoandingPanel";
import LoginTopBar from "../../../pages/auth/LoginTopBar";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex'
    },
    paper: {
        marginRight: theme.spacing(2)
    }
}));

function AuthPageSplash(props) {
    const {intl, setEjecutarAnimacion, setViewLogin, handleAcreditacionChange, showImageGallery} = props;

    const objGaleria = useRef(null);
    const [imagesCarrusel,
        setImagesCarrusel] = useState([]);
    const personnelLogo = "/new_logos/2p_yb.png";

    const [anchorEl,
        setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Fragment>
            <div className="content-2personnel-content">
                {/* <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                {showImageGallery && <ImageGallery showFullscreenButton={false} showPlayButton={false}
                                            items={[
                                            {
                                                original: "/media/pageSplash/2personnel_slide_mineria_nov_final-2.jpg",
                                            },
                                            {
                                                original: "/media/pageSplash/2p_final_construccion.jpg",
                                            },
                                            {
                                                original: "/media/pageSplash/2personnel_slide_industry_18_nov-3.jpg",
                                            },
                                            ]}
                                />}
                                </td>
                                <LoginTopBar handleAcreditacionChange={handleAcreditacionChange}/>
                            </tr>
                        </tbody>
                    </table>
                </div> */}
                 <LoginTopBar handleAcreditacionChange={handleAcreditacionChange}/>
            </div>
        </Fragment>
    );
}

export default WithLoandingPanel(injectIntl(AuthPageSplash));
