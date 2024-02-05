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
      <div className={"tw-flex tw-flex-col tw-h-80 tw-w-60 stats-board tw-gap-8 tw-mt-8 " + (props.className || "")}>

        {props.fields && 
          props.fields.map((field: StatField)=>{
            return (
              <div 
                className="stats-field tw-flex tw-flex-col tw-justify-start tw-items-start tw-pl-14">
                <h3 className="stats-field-name tw-p-1 tw-pb-0 tw-m-0 tw-text-lg tetris-font">
                  {field.name}
                </h3>
                <div className="stats-field-value-bg tw-w-32 tw-bg-black tw-bg-opacity-50 tw-rounded-lg">
                <h3 className="stats-field-value tw-font-extrabold timer-font tw-pt-0 tw-pl-4 tw-m-0  tw-text-yellow-400 tw-text-3xl tw-text-left">
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