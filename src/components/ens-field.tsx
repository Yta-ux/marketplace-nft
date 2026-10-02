import { SelectField } from "@/components/select-field"
import { Input } from "@/components/ui/input"

const suffixes = [{ value: ".eth", label: ".eth" }]

export function EnsField({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex w-full gap-2.5">
      <SelectField
        id={`${id}-suffix`}
        ariaLabel="Domínio ENS"
        placeholder=".eth"
        options={suffixes}
        value=".eth"
        onValueChange={() => undefined}
        arrow="ens"
        className="w-[78px] shrink-0 gap-1.5 pt-2.5 pr-2 pb-3 pl-2.5 text-body text-foreground"
      />
      <Input id={id} name={name} autoComplete="off" />
    </div>
  )
}
