import React from "react";

const styles = {
  ul: {
    'list-style': 'none',
    'margin-left': '-20px',
    'text-align': 'left',
    margin: 'auto',
    'margin-top': '10px',
  },
  li: {
    'margin-bottom': '0.25rem',
  },
  divContainer: {
    'vertical-align': 'middle',
    display: 'inline-flex',
    'line-height': '27px',
  },
  divBox: {
    width: '25px',
    height: '25px',
  },
  divDesc: {
    'padding-left': '10px',
  }
}

const BoxStyleList = ({
  list,
  cssClass,
}) => {
  const itemRender = ({ item }) => {
    return (
      <div style={styles.divContainer}>
        <div style={styles.divBox} className={item.boxClass} />
        <div style={styles.divDesc}>
          <em className={item.textClass}>{item.text}</em>
        </div>
      </div>
    );
  }

  return (
    <ul style={styles.ul} className={cssClass}>
      {
        list && list.map((item, index) => {
          return (
            <li key={index} style={styles.li}>
              {itemRender({ item })}
            </li>
          );
        })
      }
    </ul>
  );
}

export default BoxStyleList;