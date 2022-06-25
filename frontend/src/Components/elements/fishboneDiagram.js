import s from "./elements.module.scss";

export const FishboneDiagram = ({ data }) => {
  return (
    <div>
      <div className={s.fishboneDiagram}>
        <div className={s.data}>
          {Object.entries(data).map(([problemArea, causes], i, arr) => {
            const top = !(i % 2);
            return (
              <Branch
                key={problemArea}
                problemArea={problemArea}
                causes={causes}
                top={top}
                lastBranch={top && !arr[i + 2]}
              />
            );
          })}
        </div>
        <div className={s.conclusion}>Conclusion</div>
      </div>
    </div>
  );
};

const Branch = ({ problemArea, causes, top, lastBranch }) => {
  const whyMargin = 1.3;
  return (
    <div
      className={`${s.branch} ${top ? s.top : s.bottom} ${
        lastBranch ? "lastBranch" : ""
      }`}
      // style={!top ? { paddingRight: 60 } : { paddingRight: 12 }}
    >
      <span
        style={
          top
            ? {
                marginRight:
                  Object.keys(causes).length * 25 +
                  Object.values(causes).reduce((p, a) => p + a.length, 0) * 25 -
                  15,
              }
            : {
                marginRight:
                  Object.keys(causes).length * 15 +
                  Object.values(causes).reduce((p, a) => p + a.length, 0) * 15 -
                  15,
              }
        }
      >
        {problemArea}
      </span>
      {Object.keys(causes).length > 0 && (
        <ul className={s.people}>
          {Object.entries(causes).map(([cause, whys], i, arr) => {
            const prevWhys = top
              ? arr.slice(i).reduce((p, [cause, whys]) => p + whys.length, 0)
              : arr
                  .slice(0, i)
                  .reduce((p, [cause, whys]) => p + whys.length, 0);

            const baseMargin = 1.4;
            const subMargin = 1.27;
            return (
              <li
                key={cause}
                style={
                  top
                    ? {
                        marginRight:
                          baseMargin * (arr.length - i) +
                          subMargin * prevWhys +
                          0.5 +
                          "rem",
                      }
                    : {
                        marginRight:
                          baseMargin * i + subMargin * prevWhys + "rem",
                      }
                }
              >
                <span className={s.cause}>{cause}</span>
                {whys.length > 0 && (
                  <ul>
                    {whys.map((why, i) => (
                      <li
                        key={why}
                        style={{
                          marginRight: 1.27 * i + whyMargin + "rem",
                        }}
                      >
                        {why}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
