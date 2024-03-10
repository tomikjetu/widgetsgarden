export default function Analytic({ label, value, link }) {
  return (
    <a href={link} className="analytics-list-item analytics-item-with-stats">
      <span>{label}</span>
      <span className="number"> {value || "Loading..."}</span>
    </a>
  );
}

export function SelectableAnalytic({ collections, selectedAnalytics, setSelectedAnalytics, collectionsValues }) {
  return (
    <div className="analytics-list">
      {collections.map((collection, index) => {
        var selectedOpacity = selectedAnalytics.includes(collection.value) ? 1 : 0.5;
        return (
          <div
            key={collection.value}
            className="analytics-list-item"
            onClick={() => {
              if (selectedAnalytics.includes(collection.value)) setSelectedAnalytics(selectedAnalytics.filter((s) => s != collection.value));
              else setSelectedAnalytics([...selectedAnalytics, collection.value]);
            }}
          >
            <p style={{ opacity: selectedOpacity }} className="analytics-item-with-stats">
              <span>{collection.label}</span>
              <span className="number"> {collectionsValues[collection.value]}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
