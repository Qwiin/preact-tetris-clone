import { BaseComponentProps, LAYOUT_DESKTOP, LAYOUT_MOBILE } from "../BaseTypes";

interface StatField {
  id?: string;
  name: string;
  value: number | string;
}

interface StatsPanelProps extends BaseComponentProps {
  fields: StatField[];

}

export function StatsPanel(props: StatsPanelProps) {

  return (
    <>
      <div id="#StatsPanel" data-layout={props.layout} className={"stats-panel" + (props.className || "")}>

        {props.fields && 
          props.fields.map((field: StatField, index: number)=>{
            return (
              <div 
                className="stats-field">
                <h3 className="stats-field-name">
                  {field.name}
                </h3>
                <div className="stats-field-value-bg">
                {props.layout === LAYOUT_MOBILE &&
                  <div className="tw-flex tw-items-center tw-justify-end"
                  style={{justifyContent: "flex-end",
                    width: `${4.3 - index*0.62}rem`}}>
                  <h3 className="stats-field-value">
                    {field.value}
                  </h3>
                  </div>
                }
                {props.layout === LAYOUT_DESKTOP &&
                  <h3 className="stats-field-value">
                    {field.value}
                  </h3>
                }
                </div>
              </div>
            );
          })
        }
        
      </div>
    </>
  );

}