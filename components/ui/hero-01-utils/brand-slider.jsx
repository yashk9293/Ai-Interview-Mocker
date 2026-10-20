// An endless strip under the hero. brandList: [{ name, image? }]. With an
// image it shows the logo; without one it shows the name as a pill, which is
// how the landing page lists the roles you can practise for.
export default function BrandSlider({ brandList, title = "Practise for roles like" }) {
  const items = [...brandList, ...brandList];
  return (
    <section aria-label={title} className="border-t border-line bg-surface py-6">
      <p className="mb-5 text-center text-sm font-medium text-muted-foreground">{title}</p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee flex w-max gap-3">
          {items.map((brand, i) => (
            <li key={`${brand.name}-${i}`} aria-hidden={i >= brandList.length ? "true" : undefined}>
              {brand.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.image} alt={brand.name} className="h-8 w-auto opacity-70" />
              ) : (
                <span className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-line bg-white px-5 text-sm font-medium text-foreground">
                  {brand.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
