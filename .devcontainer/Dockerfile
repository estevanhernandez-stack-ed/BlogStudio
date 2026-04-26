# BlogStudio devcontainer
# Bundles: Node 20 LTS, Hugo Extended (latest)
# Optional (commented): Ruby + Jekyll for users running Jekyll preview locally
#
# Image size: ~600MB built. Lighter than ThesisStudio because no LaTeX toolchain.

FROM mcr.microsoft.com/devcontainers/javascript-node:20

ENV DEBIAN_FRONTEND=noninteractive

# Hugo Extended (required for SCSS-using themes; we don't lock to non-extended)
RUN ARCH=$(dpkg --print-architecture) && \
    HUGO_VERSION="0.140.2" && \
    curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${ARCH}.deb" -o /tmp/hugo.deb && \
    dpkg -i /tmp/hugo.deb && \
    rm /tmp/hugo.deb

# Optional: Ruby + Jekyll for users wanting local Jekyll preview
# Uncomment the following block if you publish to a Jekyll site and want preview-in-devcontainer.
#
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     ruby-full \
#     build-essential \
#     zlib1g-dev \
#     && rm -rf /var/lib/apt/lists/* \
#     && gem install jekyll bundler --no-document

# Sanity check
RUN node --version && hugo version
