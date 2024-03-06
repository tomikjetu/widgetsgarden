import dayjs from "dayjs";
export default function ValueSwitch(type, value, preset) {
    if (value == null || value.length == 0) return <p>🌵 Unset</p>
    switch (type) {
        case "String":
        case "Number":
            return <p>{value}</p>
        case "Options":
            let { options } = preset;
            var display = options.filter(option => option.value == value)[0];
            return <p>{display?.text || "Select value"}</p>
        case "Switch":
            if (value == true) return <p>{preset.on || "ON"}</p>
            else return <p>{preset.off || "OFF"}</p>
        case "Array":
            return <p>{value.length} elements </p>
        case "Color":
            return <div className="color-display">
                <div className="value" style={{ backgroundColor: value }}></div>
                <p>{value}</p>
            </div>
        case "Date":
            return <p>
                {dayjs(value).format('DD/MM/YYYY')}
            </p>
        case "Time":
            return <p>
                {dayjs(value).format('hh:mmA')}
            </p>
        default:
            return <p>🔧 {value.toString()}</p>
    }
}