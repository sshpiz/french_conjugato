import argostranslate.package, argostranslate.translate

# Download & install package programmatically (once)
argostranslate.package.update_package_index()
packages = argostranslate.package.get_available_packages()
fr_en = list(filter(lambda p: p.from_code == "fr" and p.to_code == "en", packages))[0]
download_path = fr_en.download()
argostranslate.package.install_from_path(download_path)
