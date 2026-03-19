import os
import shutil

DOCS_DIR = "/Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/docs/nestjs"
BLOG_DIR = "/Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/blog"

files_to_move = [
    (f"{BLOG_DIR}/NestJS/OOP/part1_oop_foundation.md", f"{DOCS_DIR}/01-oop/01-foundation.md"),
    (f"{BLOG_DIR}/NestJS/OOP/part2_encapsulation_decorators.md", f"{DOCS_DIR}/01-oop/02-encapsulation-decorators.md"),
    (f"{BLOG_DIR}/NestJS/OOP/part3_interface_abstract.md", f"{DOCS_DIR}/01-oop/03-interface-abstract.md"),
    (f"{BLOG_DIR}/NestJS/OOP/part4_dependency_injection.md", f"{DOCS_DIR}/01-oop/04-dependency-injection.md"),
    (f"{BLOG_DIR}/NestJS/OOP/part5_solid_principles.md", f"{DOCS_DIR}/01-oop/05-solid.md"),
    (f"{BLOG_DIR}/NestJS/OOP/part6_design_patterns.md", f"{DOCS_DIR}/01-oop/06-design-patterns.md"),
    
    (f"{BLOG_DIR}/2026-02-11/IOC.md", f"{DOCS_DIR}/02-core-concepts/01-ioc.md"),
    (f"{BLOG_DIR}/2026-03-03/nestjs-providers-deep-dive.mdx", f"{DOCS_DIR}/02-core-concepts/02-providers-deep-dive.mdx"),
    (f"{BLOG_DIR}/2026-03-18/nestjs-dynamic-module.mdx", f"{DOCS_DIR}/02-core-concepts/03-dynamic-module.mdx"),
    (f"{BLOG_DIR}/2026-03-03/aop-trong-nestjs.mdx", f"{DOCS_DIR}/02-core-concepts/04-aop.mdx"),
    (f"{BLOG_DIR}/2026-03-19/nestjs-exception-filter.mdx", f"{DOCS_DIR}/02-core-concepts/05-exception-filter.mdx"),
    
    (f"{BLOG_DIR}/2026-03-03/debug-nodejs-nestjs-vscode.mdx", f"{DOCS_DIR}/03-tooling/01-debug-vscode.mdx"),
    
    (f"{BLOG_DIR}/NestJS/week1_plan.md", f"{DOCS_DIR}/99-plans/week1-plan.md"),
    (f"{BLOG_DIR}/NestJS/week2_plan.md", f"{DOCS_DIR}/99-plans/week2-plan.md"),
    (f"{BLOG_DIR}/NestJS/week3_plan.md", f"{DOCS_DIR}/99-plans/week3-plan.md"),
    (f"{BLOG_DIR}/NestJS/week4_plan.md", f"{DOCS_DIR}/99-plans/week4-plan.md"),
    (f"{BLOG_DIR}/NestJS/week5_plan.md", f"{DOCS_DIR}/99-plans/week5-plan.md"),
    (f"{BLOG_DIR}/NestJS/week6_plan.md", f"{DOCS_DIR}/99-plans/week6-plan.md"),
]

for src, dst in files_to_move:
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        print(f"Moved {src} to {dst}")
    else:
        print(f"File not found: {src}")
