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
      <div className={"tw-flex tw-flex-col tw-h-80 tw-w-60 stats-board tw-gap-4 tw-mt-2 " + (props.className || "")}>

        {props.fields && 
          props.fields.map((field: StatField)=>{
            return (
              <div 
                className="stats-field tw-flex tw-flex-col tw-justify-start tw-items-start tw-pl-14">
                <h3 className="stats-field-name tw-p-1 tw-pb-0 tw-m-0 tw-text-xl tetris-font">
                  {field.name}
                </h3>
                <div className="tw-w-32 tw-bg-black tw-bg-opacity-50">
                <h3 className="stats-field-value tw-font-extrabold timer-font tw-pt-1 tw-m-0  tw-text-yellow-400 tw-text-4xl">
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