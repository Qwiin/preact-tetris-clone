import { BaseComponentProps } from "../BaseTypes";

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
          props.fields.map((field: StatField)=>{
            return (
              <div 
                className="stats-field">
                <h3 className="stats-field-name">
                  {field.name}
                </h3>
                <div className="stats-field-value-bg">
                <h3 className="stats-field-value">
                  {field.value}
                </h3>
                </div>
              </div>
            );
          })
        }
        
      </div>
    </>
  );

}