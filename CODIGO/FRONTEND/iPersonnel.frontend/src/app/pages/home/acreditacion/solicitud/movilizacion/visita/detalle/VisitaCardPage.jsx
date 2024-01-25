import React, { useEffect } from "react";
/* import StatusCardsGroup, {
  TIPO_TARJETA
} from "../../../../../partials/components/Dashboard/StatusCardsGroup"; */
import { injectIntl } from "react-intl";
import { withRouter } from "react-router-dom";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";

const VisitaCardPage = ({
  cardGroupItemList = [],
  cardItemList,
  cardRefresh,
  setCardRefresh,
  refreshCardGroup
}) => {
  console.log("VisitaCardPage cardGroupItemList", cardGroupItemList);
  return (
    <div className="row">
      <div className="col-12">
        <div className="row">
          {cardGroupItemList.map(group => {
            //let infoGrupo = TypeGroups.filter(x => x.value === group.grupo)[0];
            //console.log(group);
            return (
              <div
                key={`div_gsc_${group.info.IdMenu}`}
                className="col-12 col-sm-12 col-lg-12"
              >
               {/*  <StatusCardsGroup
                  key={`div-group-${group.info.IdMenu}`}
                  id={`div-group-${group.info.IdMenu}`}
                  tipo={TIPO_TARJETA.CARD_3}
                  items={cardItemList}
                  refresh={cardRefresh}
                  setRefresh={setCardRefresh}
                  cardChangeEvent={refreshCardGroup}
                  info={group.info}
                /> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisitaCardPage;
