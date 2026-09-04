import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="bg-sparkle flex min-h-[60vh] items-center justify-center px-5 py-20 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-950 sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-gray-500">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3 font-semibold text-white transition hover:brightness-110"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
