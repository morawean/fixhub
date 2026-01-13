package com.example.fixhub.controller;

import com.example.fixhub.config.RouteConfig;
import com.example.fixhub.service.FixEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ConfigController {

    @Autowired
    private FixEngineService fixEngineService;

    private static List<RouteConfig> routes = new ArrayList<>();

    static {
        RouteConfig r1 = new RouteConfig();
        r1.from = "incoming";
        r1.to = "outgoing";
        r1.conditionTag = null;
        r1.conditionValue = null;
        routes.add(r1);
    }

    @GetMapping("/config")
    public ResponseEntity<String> getConfig() {
        return ResponseEntity.ok("default config");
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteConfig>> getRoutes() {
        return ResponseEntity.ok(routes);
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteConfig> createRoute(@RequestBody RouteConfig route) {
        if (route.from == null || route.from.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (route.to == null || route.to.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        routes.add(route);
        return ResponseEntity.ok(route);
    }

    @PutMapping("/routes/{index}")
    public ResponseEntity<RouteConfig> updateRoute(@PathVariable int index, @RequestBody RouteConfig route) {
        if (index < 0 || index >= routes.size()) {
            return ResponseEntity.notFound().build();
        }
        if (route.from == null || route.from.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (route.to == null || route.to.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        routes.set(index, route);
        return ResponseEntity.ok(route);
    }

    @DeleteMapping("/routes/{index}")
    public ResponseEntity<Void> deleteRoute(@PathVariable int index) {
        if (index < 0 || index >= routes.size()) {
            return ResponseEntity.notFound().build();
        }
        routes.remove(index);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/config/reload")
    public ResponseEntity<String> reloadConfig(@RequestParam String path) {
        File f = new File(path);
        if (!f.exists()) return ResponseEntity.badRequest().body("file not found");
        fixEngineService.reloadConfig(f);
        return ResponseEntity.ok("reloaded");
    }
}
